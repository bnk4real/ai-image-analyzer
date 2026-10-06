"use client";

import React from "react";
import { authenticate, authenticateDemo } from "@/lib/actions";
import { Spinner } from "@/components/Icons";
import ThemeToggle from "@/components/ThemeToggle";

const LoginForm = ({ demo }: { demo: boolean }) => {
    const [errorMessage, dispatch, isPending] = React.useActionState(authenticate, undefined);
    const [demoError, demoDispatch, demoPending] = React.useActionState(authenticateDemo, undefined);

    return (
        <main className="relative flex min-h-screen items-center justify-center px-4">
            <div className="absolute right-4 top-4">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-sm">
                <p className="mb-1 text-sm font-medium text-muted">Report AI Analysis</p>
                <h1 className="mb-8 text-3xl font-semibold tracking-tight">Sign in</h1>

                <form action={dispatch} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="label">
                            Email or username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            autoFocus
                            required
                            className="input"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="label">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="input"
                        />
                    </div>

                    {errorMessage && (
                        <p className="alert-error" role="alert">
                            {errorMessage}
                        </p>
                    )}

                    <button type="submit" className="btn-primary mt-2 w-full" disabled={isPending}>
                        {isPending ? (
                            <>
                                <Spinner />
                                Signing in...
                            </>
                        ) : (
                            "Continue"
                        )}
                    </button>
                </form>

                {demo && (
                    <form action={demoDispatch} className="mt-8 border-t border-line pt-6">
                        <p className="text-sm font-medium">Try the demo</p>
                        <p className="mt-1 text-sm text-muted">
                            All data is fictional and no password is needed. It is reset from time to time.
                        </p>
                        {demoError && (
                            <p className="alert-error mt-3" role="alert">
                                {demoError}
                            </p>
                        )}
                        <button type="submit" className="btn-secondary mt-4 w-full" disabled={demoPending || isPending}>
                            {demoPending ? (
                                <>
                                    <Spinner />
                                    Signing in...
                                </>
                            ) : (
                                "Open the demo"
                            )}
                        </button>
                    </form>
                )}
            </div>
        </main>
    );
};

export default LoginForm;
