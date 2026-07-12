"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import {
  fetchResultsApi,
  SessionResultItem,
} from "@/features/makeup-advisor/api/session-results-api";
import { getSessionId } from "@/core/utils/session";
import { capitalizeText } from "@/core/utils/common";
import TopRow from "@/design-system/components/common/top-row";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const SessionResults = () => {
  const t = useTranslations();
  const router = useRouter();
  const [results, setResults] = useState<SessionResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResults = async () => {
      const sessionId = await getSessionId();
      if (!sessionId) {
        setError("No session found");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetchResultsApi(sessionId);

        if (response.success && response.data) {
          const filteredResults = response.data.filter(
            (result) => result.is_ready && result.output_url
          );
          setResults(filteredResults);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Error fetching results:", err);
        setError("Failed to load results");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, []);

  return (
    <div className="h-full w-full bg-black text-white min-h-screen">
      <div className="p-4">
        <TopRow onBack={() => router.back()} />
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold text-center mb-8">
          {t("sessionResults.title")}
        </h1>

        <div className="mt-8">
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="w-12 h-12 animate-spin text-white" />
              <span className="ml-4 text-3xl">{t("sessionResults.loading")}</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-[400px]">
              <p className="text-red-400 text-3xl">{error}</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className="bg-gray-900 rounded-2xl overflow-hidden border-2 border-gray-700 hover:border-white transition-colors"
                >
                  <div className="relative w-full h-[500px]">
                    <Image
                      src={result.output_url}
                      alt={`${capitalizeText(result.hairstyle_name)} ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        console.error("Error loading image:", result.output_url);
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-3xl font-semibold text-white">
                      {capitalizeText(result.hairstyle_name)}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[400px]">
              <p className="text-gray-400 text-3xl">
                {t("sessionResults.noResults")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionResults;
