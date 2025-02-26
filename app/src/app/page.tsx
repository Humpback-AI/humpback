"use client";

// import { useQuery } from "@tanstack/react-query";

// import { useTinybird } from "@/contexts/TinybirdContext";

// const ENDPOINT_URL =
//   "https://api.us-east.aws.tinybird.co/v0/pipes/chunks_referenced_by_search.json";

export default function HomePage() {
  // const { fetchWithToken } = useTinybird();

  // const { data } = useQuery({
  //   queryKey: ["tinybird-analytics"],
  //   queryFn: () => fetchWithToken(ENDPOINT_URL, {}),
  // });
  // console.log("🚀 ~ HomePage ~ data:", data);

  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Welcome to Humpback</h1>
      <p className="text-gray-600 text-lg mb-8">
        Your modern marketplace platform for managing and growing your business.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Quick Start</h2>
          <p className="text-gray-600">
            Get started by exploring your dashboard or creating your first
            listing.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
          <p className="text-gray-600">
            Check out our documentation or contact support for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
