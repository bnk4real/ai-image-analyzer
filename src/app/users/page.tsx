"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { AlertIcon, Spinner, UsersIcon } from "@/components/Icons";

interface User {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
}

const UsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("/ai-image-analyzer/api/users");
                if (!response.ok) {
                    throw new Error("Failed to fetch users");
                }
                const data = await response.json();
                setUsers(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const getInitials = (first: string, last: string) => {
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    };

    return (
        <div>
            <PageHeader
                title="Users"
                description="View registered users."
                actions={
                    <span className="rounded-md bg-surface-2 px-2.5 py-1 text-sm font-medium text-muted">
                        {users.length} total
                    </span>
                }
            />

            <div className="card overflow-hidden">
                {loading ? (
                    <div className="flex h-56 items-center justify-center text-accent">
                        <Spinner width={28} height={28} />
                    </div>
                ) : error ? (
                    <div className="alert-error m-5 flex items-start gap-2.5" role="alert">
                        <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
                        <p>Error loading users: {error}</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="py-14 text-center">
                        <UsersIcon className="mx-auto text-muted" width={40} height={40} />
                        <h3 className="mt-3 text-sm font-medium">No users found</h3>
                        <p className="mt-1 text-sm text-muted">Get started by registering a new user.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-line">
                            <thead className="bg-surface-2">
                                <tr>
                                    {["User", "Email", "Status"].map((heading) => (
                                        <th
                                            key={heading}
                                            scope="col"
                                            className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted"
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {users.map((user) => (
                                    <tr key={user.user_id} className="transition-colors hover:bg-surface-2">
                                        <td className="whitespace-nowrap px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-2 text-xs font-semibold text-muted">
                                                    {getInitials(user.first_name, user.last_name)}
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {user.first_name} {user.last_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-3.5 text-sm text-muted">{user.email}</td>
                                        <td className="whitespace-nowrap px-5 py-3.5">
                                            <span className="rounded-md bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                                                Active
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsersPage;
