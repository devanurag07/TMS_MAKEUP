"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  isSalonServiceEnabled,
  type SalonServiceId,
} from "@/core/utils/salon-services";

export function useSalonServiceGuard(
  service: SalonServiceId,
  disabledMessage: string,
) {
  const router = useRouter();

  useEffect(() => {
    if (!isSalonServiceEnabled(service)) {
      toast.info(disabledMessage, { autoClose: 4000 });
      router.replace("/select-tool");
    }
  }, [service, disabledMessage, router]);
}
