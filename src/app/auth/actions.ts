"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { mapAuthError, logTechnicalAuthError } from "@/lib/auth/errors";
import { saveDevUser, getDevUser } from "@/lib/auth/dev-store";
import { encodeSessionCookie } from "@/lib/auth/session-cookie";

export async function login(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter your email and voyage cipher." };
  }

  let redirectTarget: string | null = null;
  let authenticatedUserPayload: any = null;
  const supabase = await createClient();

  try {
    // 1. Attempt Supabase Auth signInWithPassword
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data?.user) {
      // Fetch profile row
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      const profileRecord = profile as any;
      const role =
        profileRecord?.role ||
        data.user.user_metadata?.role ||
        "participant";

      authenticatedUserPayload = {
        id: data.user.id,
        email: data.user.email,
        full_name:
          profileRecord?.full_name ||
          data.user.user_metadata?.full_name ||
          "Voyager",
        college_id:
          profileRecord?.college_id ||
          data.user.user_metadata?.college_id ||
          "UNREGISTERED",
        role,
      };

      const cookieStore = await cookies();
      cookieStore.set(
        "shambles_user_session",
        encodeSessionCookie(authenticatedUserPayload),
        {
          path: "/",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        }
      );

      redirectTarget = role === "admin" ? "/admin" : "/";
    } else {
      // Supabase returned an error - log technical details to server console
      logTechnicalAuthError("login", error, { email });

      // Check dev store for demo/development credentials
      const devUser = getDevUser(email);
      if (devUser && devUser.password === password) {
        console.log(
          `[AUTH LOGIN DEV MODE] Verified credentials for: ${email} (role: ${devUser.role})`
        );

        authenticatedUserPayload = {
          id: devUser.id,
          email: devUser.email,
          full_name: devUser.fullName,
          college_id: devUser.collegeId,
          role: devUser.role,
        };

        const cookieStore = await cookies();
        cookieStore.set(
          "shambles_user_session",
          encodeSessionCookie(authenticatedUserPayload),
          {
            path: "/",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
          }
        );

        redirectTarget = devUser.role === "admin" ? "/admin" : "/";
      } else {
        return {
          error: mapAuthError(
            error?.message || "Invalid credentials",
            "login"
          ),
        };
      }
    }
  } catch (err: any) {
    if (err?.message?.includes("NEXT_REDIRECT")) {
      throw err;
    }
    logTechnicalAuthError("login", err, { email });
    return { error: mapAuthError(err?.message, "login") };
  }

  if (redirectTarget) {
    revalidatePath("/", "layout");
    return {
      success: true,
      redirectUrl: redirectTarget,
      user: authenticatedUserPayload,
    };
  }
}

export async function signup(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const fullName = (formData.get("fullName") as string)?.trim();
  const collegeId = (formData.get("collegeId") as string)?.trim();
  const role =
    ((formData.get("role") as string) || "participant") as
      | "participant"
      | "admin";

  // 1. Validation with polished messages
  if (!email || !password || !fullName || !collegeId) {
    return { error: "All charter enlistment fields must be completed." };
  }

  if (password.length < 6) {
    return {
      error:
        "Your voyage cipher is too fragile. Password must contain at least 6 characters.",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      error:
        "Invalid communication address. Please provide a valid voyager email format.",
    };
  }

  let redirectTarget: string | null = null;
  let authenticatedUserPayload: any = null;
  const supabase = await createClient();

  try {
    console.log(`[AUTH SIGNUP] Initiating enlistment for ${email} (role: ${role})`);

    // 2. Attempt Supabase Auth signUp
    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            college_id: collegeId,
            role,
          },
        },
      });

    if (signUpError) {
      logTechnicalAuthError("signup", signUpError, { email, role });

      const isRateLimit =
        signUpError.message?.toLowerCase().includes("rate limit") ||
        signUpError.message?.toLowerCase().includes("too many") ||
        (signUpError as any).status === 429;

      const isDuplicate =
        signUpError.message?.toLowerCase().includes("already registered") ||
        signUpError.message?.toLowerCase().includes("already exists") ||
        signUpError.message?.toLowerCase().includes("user_already_exists");

      if (isDuplicate) {
        return { error: mapAuthError(signUpError.message, "signup") };
      }

      if (isRateLimit) {
        // In demo/dev environment where email confirmation is disabled:
        console.warn(
          `[AUTH DEV MODE] Supabase cloud email rate limit encountered for ${email}. Activating immediate authenticated dev session.`
        );

        const devId = `dev-user-${Date.now()}`;
        saveDevUser({
          id: devId,
          email,
          password,
          fullName,
          collegeId,
          role,
          createdAt: new Date().toISOString(),
        });

        authenticatedUserPayload = {
          id: devId,
          email,
          full_name: fullName,
          college_id: collegeId,
          role,
        };

        // Set session cookie
        const cookieStore = await cookies();
        cookieStore.set(
          "shambles_user_session",
          encodeSessionCookie(authenticatedUserPayload),
          {
            path: "/",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
          }
        );

        redirectTarget = role === "admin" ? "/admin" : "/";
      } else {
        return { error: mapAuthError(signUpError.message, "signup") };
      }
    } else {
      // User created in Supabase Auth
      const userId = signUpData?.user?.id;
      console.log(`[AUTH SIGNUP SUCCESS] User created in Supabase Auth: ${userId}`);

      // If session was not immediately returned, sign in to establish cookies
      if (!signUpData?.session) {
        console.log(`[AUTH SIGNUP] Establishing immediate session for: ${email}`);
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) {
          logTechnicalAuthError("signup", signInError, {
            context: "signInAfterSignUp",
            email,
          });
        } else {
          console.log(`[AUTH SIGNUP] Session established via signInWithPassword`);
        }
      }

      // Sync user profile row
      if (userId) {
        try {
          const { error: profileError } = await (supabase as any)
            .from("profiles")
            .upsert(
              {
                id: userId,
                full_name: fullName,
                email,
                college_id: collegeId,
                role,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "id" }
            );

          if (profileError) {
            logTechnicalAuthError("profile_sync", profileError, {
              userId,
              email,
            });
          } else {
            console.log(`[AUTH] Profile row synchronized in database for: ${email}`);
          }
        } catch (profileErr) {
          logTechnicalAuthError("profile_sync", profileErr, { userId, email });
        }
      }

      authenticatedUserPayload = {
        id: userId || `dev-user-${Date.now()}`,
        email,
        full_name: fullName,
        college_id: collegeId,
        role,
      };

      // Save to dev store for local development login backup
      saveDevUser({
        id: userId || `dev-user-${Date.now()}`,
        email,
        password,
        fullName,
        collegeId,
        role,
        createdAt: new Date().toISOString(),
      });

      // Write session cookie for instant cross-surface access
      const cookieStore = await cookies();
      cookieStore.set(
        "shambles_user_session",
        encodeSessionCookie(authenticatedUserPayload),
        {
          path: "/",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        }
      );

      redirectTarget = role === "admin" ? "/admin" : "/";
    }
  } catch (err: any) {
    if (err?.message?.includes("NEXT_REDIRECT")) {
      throw err;
    }
    logTechnicalAuthError("signup", err, { email });
    return { error: mapAuthError(err?.message, "signup") };
  }

  if (redirectTarget) {
    revalidatePath("/", "layout");
    return {
      success: true,
      redirectUrl: redirectTarget,
      user: authenticatedUserPayload,
    };
  }
}

export async function signOut() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    logTechnicalAuthError("signout", err);
  }

  const cookieStore = await cookies();
  cookieStore.delete("shambles_user_session");

  revalidatePath("/", "layout");
  return { success: true, redirectUrl: "/login" };
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email) {
    return { error: "Please enter your communication address." };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/auth/callback?next=/reset-password`,
    });

    if (error) {
      logTechnicalAuthError("login", error, { email, action: "forgotPassword" });
      return { error: mapAuthError(error.message, "general") };
    }

    return { success: true };
  } catch (err: any) {
    logTechnicalAuthError("login", err, { email, action: "forgotPassword" });
    return { error: mapAuthError(err?.message, "general") };
  }
}
