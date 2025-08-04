"use client";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="p-4 bg-red-100 text-red-700 rounded-lg">
      <h2 className="text-lg font-bold">Erro de Análise</h2>
      <p>{error.message}</p>
      <button 
        onClick={reset}
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Tentar Novamente
      </button>
    </div>
  );
}
