"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type BuildVersionPayload = {
  version?: string;
};

export function PwaUpdateChecker() {
  const bundledVersion = useMemo(
    () => process.env.NEXT_PUBLIC_BUILD_VERSION || "dev-local",
    []
  );
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [remoteVersion, setRemoteVersion] = useState<string | null>(null);
  const checkingRef = useRef(false);
  const basePath = process.env.NODE_ENV === "production" ? "/practice" : "";

  useEffect(() => {
    const fetchRemoteVersion = async () => {
      if (checkingRef.current) return;
      checkingRef.current = true;

      try {
        const response = await fetch(
          `${basePath}/build-version.json?ts=${Date.now()}`,
          { cache: "no-store" }
        );

        // Strict offline safety: no successful network response means no prompt.
        if (!response.ok) return;

        const payload = (await response.json()) as BuildVersionPayload;
        const nextVersion = payload.version?.trim();
        if (!nextVersion) return;

        setRemoteVersion(nextVersion);
        if (nextVersion !== bundledVersion) {
          const dismissed = sessionStorage.getItem("pwa-update-dismissed-version");
          if (dismissed !== nextVersion) {
            setUpdateAvailable(true);
          }
        }
      } catch {
        // Intentionally silent: network errors/offline should not trigger prompts.
      } finally {
        checkingRef.current = false;
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void fetchRemoteVersion();
      }
    };

    void fetchRemoteVersion();
    window.addEventListener("focus", fetchRemoteVersion);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", fetchRemoteVersion);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [basePath, bundledVersion]);

  if (!updateAvailable || !remoteVersion) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 mx-auto w-[calc(100%-2rem)] max-w-xl rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm">
          A new version is available. Reload to get the latest words.
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              sessionStorage.setItem("pwa-update-dismissed-version", remoteVersion);
              setUpdateAvailable(false);
            }}
          >
            Later
          </Button>
          <Button size="sm" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      </div>
    </div>
  );
}
