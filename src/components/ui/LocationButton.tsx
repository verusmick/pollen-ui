"use client";

import { useState } from "react";
import { BiMap, BiX } from "react-icons/bi";
import { TbLocationFilled } from "react-icons/tb";
import { Tooltip } from "./Tooltip";
import { useLocationStore } from "@/store/locationStore";
import { useTranslations } from "next-intl";

interface LocationButtonProps {
  tooltipText: string;
}

export const LocationButton = ({ tooltipText }: LocationButtonProps) => {
  const t = useTranslations("forecastPage.show_your_location");
  const [open, setOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<
    "idle" | "granted" | "denied" | "prompt"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const setLocation = useLocationStore((state) => state.setLocation);

  const handleRequestPermission = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setPermissionStatus("granted");
        setError(null);
        setLocation(coords);
        setOpen(false);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionStatus("denied");
        } else {
          setError(err.message);
        }
      }
    );
  };

  return (
    <>
      <Tooltip text={tooltipText} position="left" visible={!open}>
        <button
          onClick={() => setOpen(true)}
          className="bg-card hover:bg-neutral-800 text-white p-2 rounded-full shadow-lg focus:outline-none"
        >
          <TbLocationFilled size={20} />
        </button>
      </Tooltip>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-card rounded-xl shadow-xl w-[360px] p-6 flex flex-col gap-4 text-white relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <BiX size={22} />
            </button>

            <h2 className="text-xl font-semibold text-center">
              {t("name_company")}
            </h2>

            <p className="text-sm text-gray-300 text-center">
              {t("description_card_location")}
            </p>

            <button
              onClick={handleRequestPermission}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-all"
            >
              <BiMap size={20} />
              {t("title_button_location")}
            </button>

            {permissionStatus === "granted" && (
              <p className="text-center text-sm text-green-400">
                ✅ {t("description_permission_granted")}
              </p>
            )}
            {permissionStatus === "denied" && (
              <p className="text-center text-sm text-red-400">
                ⚠️ {t("description_permission_denied")}
              </p>
            )}
            {error && (
              <p className="text-center text-sm text-red-400">⚠️ {error}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
