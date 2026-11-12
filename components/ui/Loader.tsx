"use client";

import { useEffect, useState } from "react";

const LOADER_KEY = "masonarc-loader-seen";

export default function Loader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(LOADER_KEY)) return;
      sessionStorage.setItem(LOADER_KEY, "1");
      setVisible(true);
    } catch {
      setVisible(true);
    }

    const timer = setTimeout(() => {
      setVisible(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="loader">
      <div className="loader-content">

        {/* Mason & Arc Logo */}
        <div className="logo-wrap">
          <svg
            width="420"
            height="420"
            viewBox="0 0 488 488"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M150 97L136 134V375L150 405V97Z"
              fill="white"
            />

            <path
              d="M207 98H212V335H207V98Z"
              fill="white"
            />

            <path
              d="
                M280 98
                H268
                V403
                L279 388
                L284 374
                V159
                L269 170
                L280 132
                V98
                Z
              "
              fill="white"
            />

            <path
              d="M358 172H344V403L358 376V172Z"
              fill="white"
            />
          </svg>
        </div>

        <p className="loading-text">
          FROM CONCEPT TO DETAIL
        </p>
      </div>

      <style jsx>{`
        .loader {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          animation: loaderExit 0.55s ease-out 1.2s forwards;
        }

        .loader-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: contentExit 0.55s ease-out 1.2s forwards;
        }

        .logo-wrap {
          width: 420px;
          height: 420px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: logoEnter 1.4s
            cubic-bezier(0.22, 1, 0.36, 1)
            forwards;
        }

        .logo-wrap svg {
          width: 420px;
          height: 420px;
          animation: none;
          transform-origin: center;
        }

        .loading-text {
          margin-top: 5px;
          color: white;
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.5em;
          opacity: 0;
          animation: textEnter 0.45s ease 0.25s forwards;
        }

        @keyframes logoEnter {
          0% {
            opacity: 0;
            transform: scale(0.55);
          }

          60% {
            opacity: 1;
            transform: scale(1.06);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes logoFloat {
          0%,
          100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.035);
          }
        }

        @keyframes textEnter {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes loaderExit {
          0% {
            opacity: 1;
            filter: blur(0);
            visibility: visible;
          }

          100% {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
          }
        }

        @keyframes contentExit {
          0% {
            opacity: 1;
            transform: scale(1);
          }

          55% {
            opacity: 0.9;
            transform: scale(1.005);
          }

          100% {
            opacity: 0;
            transform: scale(1.01);
          }
        }

        @media (max-width: 640px) {
          .logo-wrap {
            width: 300px;
            height: 300px;
          }

          .logo-wrap svg {
            width: 300px;
            height: 300px;
          }

          .loading-text {
            font-size: 10px;
            letter-spacing: 0.4em;
          }
        }
      `}</style>
    </div>
  );
}
