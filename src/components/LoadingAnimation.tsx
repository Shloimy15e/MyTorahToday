export default function LoadingAnimation() {
  return (
    <div className="flex justify-center items-center h-40">
      <div className="w-64 h-32 bg-gray-200 rounded-lg overflow-hidden">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2 mx-4 mt-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-2 mx-4"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6 mx-4"></div>
        </div>
      </div>
    </div>
  );
}
