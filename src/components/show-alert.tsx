/** biome-ignore-all lint/a11y/noStaticElementInteractions: needed */
/** biome-ignore-all lint/style/useConst: needed */
/** biome-ignore-all lint/suspicious/noExplicitAny: needed */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: needed */
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { create } from "zustand";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

type TShowAlertState = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useShowAlertState = create<TShowAlertState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

interface ShowAlertComponentProps {
  title: string;
  message: string;
  onConfirm?: () => Promise<void> | void;
  onCancel?: () => void;
  icon?: React.ReactNode;
  confirmButtonText?: string;
  confirmInputText?: string;
  successTitle?: string;
}

const ShowAlertComponent: React.FC<ShowAlertComponentProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  icon,
  confirmButtonText,
  confirmInputText: _confirmText,
  successTitle,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  let lang = window.location.pathname.split("/")[1] as "fr" | "en";
  const [error, setError] = useState("");
  const [confirmInputText, setConfirmInputText] = useState("");
  const [success, setSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!["fr", "en"].includes(lang)) {
    lang = "en";
  }

  const langs = {
    fr: {
      ok: "Oui",
      cancel: "Annuler",
      error: "Une erreur innatendu s'est produite.",
      type_the_text_to_confirm: "Tapez le texte suivant pour confirmer: ",
      type_to_confirm_placeholder: "Tapez le texte ci-dessus pour confirmer.",
      wait: "Patientez...",
      retry: "Rééssayer",
    },
    en: {
      ok: "Yes",
      cancel: "Cancel",
      error: "An unexpected error ocurred.",
      type_the_text_to_confirm: "Type the following text to confirm: ",
      type_to_confirm_placeholder: "Type the text above to confirm.",
      wait: "Wait...",
      retry: "Try again",
    },
  };

  const isOkButtonDisabled =
    !!_confirmText && confirmInputText.trim() !== _confirmText;

  const removeFromTheDom = () => {
    containerRef.current?.remove();
  };
  const handleClose: React.MouseEventHandler<HTMLElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;
    if (onCancel) onCancel();
    setVisible(false);
    showAlertState.setOpen(false);
    setTimeout(() => {
      removeFromTheDom();
    }, 500);
  };

  const handleConfirm: React.MouseEventHandler<HTMLButtonElement> = async (
    e
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setError("");
      setIsLoading(true);
      if (onConfirm) await onConfirm();
      setSuccess(true);
      setTimeout(() => {
        setVisible(false);
      }, 1000);
      setTimeout(() => {
        removeFromTheDom();
      }, 1700);
      showAlertState.setOpen(false);
    } catch (_e) {
      const e = _e as Error;
      if (e.message === "error") {
        setError(langs[lang].error);
      } else {
        setError(e.message ?? langs[lang].error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const showAlertState = useShowAlertState();

  // biome-ignore lint/correctness/useExhaustiveDependencies: needed
  useEffect(() => {
    setVisible(true);
    showAlertState.setOpen(true);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "z-50 !pointer-events-auto fixed transition-opacity inset-0 flex justify-center items-center p-3 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className="bg-black/50 backdrop-blur-sm w-full h-full fixed flex justify-center items-center"
        onClick={handleClose}
      />
      <Sizer>
        {({ size, ref }) => (
          <div
            className={cn(
              "bg-card rounded-lg transform -translate-y-10 transition-[height,width,transform,opacity] duration-300 ease-bounce m-auto overflow-hidden",
              visible && "-translate-y-0"
            )}
            style={{ width: size?.width, height: size?.height }}
          >
            <div ref={ref} className="w-full">
              <div
                className={
                  "z-10 p-6 max-w-md overflow-hidden w-full h-fit mx-auto"
                }
              >
                <div className="ml-auto w-fit">
                  <Button
                    size={"icon"}
                    className="bg-gray-50 rounded-full ml-auto text-blue3/70 hover:text-blue3"
                    variant={"ghost"}
                    onClick={handleClose}
                  >
                    <X />
                  </Button>
                </div>
                {isLoading || success ? (
                  <div className="mx-auto flex flex-col justify-center items-center text-center gap-2">
                    <div className="relative h-32 w-32 flex justify-center items-center">
                      <CheckCircle2
                        size={96}
                        className={cn(
                          "opacity-0 scale-0 transition ease-bounce text-success absolute",
                          success && "opacity-100 scale-100"
                        )}
                      />
                      <div
                        className={cn(
                          "absolute scale-0 transition ease-bounce",
                          isLoading && "opacity-100 scale-100"
                        )}
                      >
                        <Loader2
                          className="animate-spin text-primary"
                          size={64}
                        />
                      </div>
                    </div>
                    {(isLoading || (success && successTitle)) && (
                      <p
                        className={cn(
                          "text-gray text-xl font-semibold font-fuzzy mb-4",
                          success && "text-success"
                        )}
                      >
                        {isLoading ? langs[lang].wait : successTitle}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    {error ? (
                      <XCircle className="text-red h-32 w-32 mx-auto" />
                    ) : (
                      icon ?? (
                        <AlertTriangle className="h-32 w-32 mx-auto mb-6 text-orange/70" />
                      )
                    )}
                    <h2
                      className={cn(
                        "text-xl font-bold text-primary font-fuzzy mt-3",
                        error && "text-red"
                      )}
                    >
                      {error || title}
                    </h2>
                    <p className="mb-4 text-sm mt-2 text-blue3/50">{message}</p>
                    {_confirmText && (
                      <form>
                        <div>
                          <Label
                            htmlFor="confirm-text"
                            className="text-gray !select-text"
                          >
                            {langs[lang].type_the_text_to_confirm}
                          </Label>
                          <br />
                          <code className="bg-gray-50 py-0.5 px-2 rounded-sm border mt-1 inline-block text-primary">
                            <strong>{_confirmText}</strong>
                          </code>
                        </div>

                        <Input
                          autoFocus
                          className="text-center mt-4 placeholder:text-gray/30 font-semibold border-2 text-gray focus:border-gray w-full"
                          autoComplete="off"
                          name="confirm-text"
                          placeholder={langs[lang].type_to_confirm_placeholder}
                          value={confirmInputText}
                          onChange={(e) => setConfirmInputText(e.target.value)}
                        />
                      </form>
                    )}
                    <div className="flex flex-row-reverse flex-wrap justify-center gap-4 mt-8">
                      <Button
                        disabled={isOkButtonDisabled}
                        variant={"ghost"}
                        className="text-primary hover:bg-primary hover:text-white ease-bounce duration-300"
                        onClick={handleConfirm}
                      >
                        <span>
                          {error
                            ? langs[lang].retry
                            : confirmButtonText ?? langs[lang].ok}
                        </span>
                        <ArrowRight className="ml-2" />
                      </Button>
                      <Button
                        variant="outline"
                        className="text-blue3 border-blue3 hover:text-blue3 ease-bounce duration-300"
                        onClick={handleClose}
                      >
                        <X className="mr-2" />
                        <span>{langs[lang].cancel}</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Sizer>
    </div>
  );
};

export const showAlert = ({
  title,
  message,
  onCancel,
  onConfirm,
  icon,
  confirmButtonText,
  confirmInputText,
  successTitle,
}: {
  title: string;
  message: string;
  onConfirm?: () => Promise<any>;
  onCancel?: () => void;
  icon?: React.ReactNode;
  confirmButtonText?: string;
  confirmInputText?: string;
  successTitle?: string;
}) => {
  const alertRoot = document.createElement("div");
  document.body.appendChild(alertRoot);

  const root = createRoot(alertRoot);
  root.render(
    <ShowAlertComponent
      title={title}
      message={message}
      onConfirm={onConfirm}
      onCancel={onCancel}
      icon={icon}
      confirmButtonText={confirmButtonText}
      confirmInputText={confirmInputText}
      successTitle={successTitle}
    />
  );
};

const Sizer = ({
  children,
}: Readonly<{
  children: (options: {
    size?: DOMRect;
    isLoaded: boolean;
    ref: React.RefObject<HTMLDivElement | null>;
  }) => any;
}>) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [size, setSize] = useState<DOMRect>();

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setSize(entry.contentRect);
      }
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return <>{children({ size, isLoaded, ref })}</>;
};
