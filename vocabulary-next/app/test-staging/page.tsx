export default function TestStagingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Staging Environment Test Page</h1>
      <p className="text-xl mb-4">
        If you can see this page, the staging environment is working correctly!
      </p>
      <div className="p-4 bg-yellow-100 border border-yellow-500 rounded-md">
        <p className="font-mono">
          Environment: {process.env.NEXT_PUBLIC_DEPLOY_ENV || 'development'}
        </p>
        <p className="font-mono">
          Build time: {new Date().toISOString()}
        </p>
      </div>
    </div>
  );
} 