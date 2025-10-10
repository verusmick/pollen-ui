"use client";

import { useState } from "react";
import { BiMap, BiX } from "react-icons/bi";
import { Tooltip } from "./Tooltip";
import { TbLocationFilled } from "react-icons/tb";

interface LocationButtonProps {
  tooltipText?: string;
}

export const LocationButton = ({
  tooltipText = "Show your location", // Cambiado aquí
}: LocationButtonProps) => {
  const [open, setOpen] = useState(false);

  const handleShowLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        alert(
          `Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`
        );
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <Tooltip text={tooltipText} position="left" visible={!open}>
        <button
          onClick={() => setOpen(true)}
          className="bg-card hover:bg-neutral-800 text-white
                     p-2 rounded-full shadow-lg focus:outline-none"
        >
          <TbLocationFilled size={20} />
        </button>
      </Tooltip>

      {/* Modal centrado */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div
            className="bg-card rounded-xl shadow-xl w-[360px] p-6 flex flex-col gap-4
                       text-white relative"
          >
            {/* Botón Cerrar */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <BiX size={22} />
            </button>

            {/* Título */}
            <h2 className="text-xl font-semibold text-center">Zuam</h2>

            {/* Descripción */}
            <p className="text-sm text-gray-300 text-center">
              Click the button below to show your current location on the map.
            </p>

            {/* Botón principal */}
            <button
              onClick={handleShowLocation}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700
                         text-white py-2 rounded-lg font-medium transition-all"
            >
              <BiMap size={20} />
              Show your location
            </button>
          </div>
        </div>
      )}
    </>
  );
};
