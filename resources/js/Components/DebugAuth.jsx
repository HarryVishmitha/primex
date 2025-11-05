import { usePage } from '@inertiajs/react';

export default function DebugAuth() {
    const { auth } = usePage().props;
    
    if (import.meta.env.PROD) {
        return null; // Don't show in production
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-md rounded-lg border border-gray-300 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-2 text-sm font-bold text-gray-900 dark:text-gray-100">
                Auth Debug Info
            </h3>
            <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                <div>
                    <strong>User:</strong> {auth?.user?.name} ({auth?.user?.email})
                </div>
                <div>
                    <strong>Roles:</strong> {auth?.roles?.join(', ') || 'None'}
                </div>
                <div>
                    <strong>Permissions:</strong>
                    <div className="ml-2 mt-1 max-h-32 overflow-y-auto">
                        {auth?.permissions?.length > 0 ? (
                            <ul className="list-disc list-inside">
                                {auth.permissions.map((perm) => (
                                    <li key={perm}>{perm}</li>
                                ))}
                            </ul>
                        ) : (
                            'None'
                        )}
                    </div>
                </div>
                <div>
                    <strong>Can Object:</strong>
                    <pre className="mt-1 max-h-32 overflow-auto rounded bg-gray-100 p-2 dark:bg-gray-900">
                        {JSON.stringify(auth?.can || {}, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
