import { useState, useRef, useEffect, useCallback } from "react";
import { MicIcon, CloseIcon, AlertIcon, CheckIcon, KeyboardIcon, LightbulbIcon } from "./icons/UIIcons";
import { parseVoiceExpense, type ParsedVoiceExpense } from "../lib/voiceParser";

interface VoiceExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (parsed: ParsedVoiceExpense) => void;
}

// Get the SpeechRecognition constructor if available
function getSpeechRecognitionClass(): any {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

export function VoiceExpenseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3 rounded-[var(--radius-card)] bg-gradient-to-r from-[var(--color-crop-50)] via-[var(--color-surface)] to-[var(--color-crop-50)] border-2 border-dashed border-[var(--color-crop-300)] text-[var(--color-ink)] hover:border-[var(--color-crop-500)] active:scale-[0.99] transition-all shadow-xs"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[var(--color-crop-500)] text-white flex items-center justify-center shadow-sm">
          <MicIcon size={20} />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-[14.5px] font-bold text-[var(--color-crop-700)]">બોલીને ખર્ચ નોંધો</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--color-crop-100)] text-[var(--color-crop-700)]">
              નવું
            </span>
          </div>
          <p className="text-[12px] text-[var(--color-ink-faint)]">
            દા.ત. &ldquo;ખાતર ૧૫૦૦ રૂપિયા&rdquo; અથવા &ldquo;ડીઝલ ૮૫૦&rdquo;
          </p>
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-[var(--color-crop-100)] text-[var(--color-crop-600)] flex items-center justify-center">
        <MicIcon size={18} />
      </div>
    </button>
  );
}

export function VoiceExpenseModal({ isOpen, onClose, onApply }: VoiceExpenseModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<ParsedVoiceExpense | null>(null);
  const [activeLang, setActiveLang] = useState<"gu-IN" | "en-IN">("gu-IN");

  // Fallback text input when speech recognition network fails
  const [fallbackInput, setFallbackInput] = useState("");

  const recognitionRef = useRef<any>(null);
  const isStoppingRef = useRef(false);

  const cleanupRecognition = useCallback(() => {
    if (recognitionRef.current) {
      isStoppingRef.current = true;
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
      } catch {
        // ignore
      }
      recognitionRef.current = null;
      isStoppingRef.current = false;
    }
    setIsListening(false);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const startListeningWithLang = useCallback(async (langToUse: "gu-IN" | "en-IN") => {
    cleanupRecognition();
    setErrorMessage(null);
    setErrorType(null);
    setTranscript("");

    const SpeechRecClass = getSpeechRecognitionClass();
    if (!SpeechRecClass) {
      setIsSupported(false);
      setErrorMessage("તમારા બ્રાઉઝરમાં Web Speech API સપોર્ટેડ નથી. કૃપા કરીને Google Chrome વાપરો.");
      return;
    }

    // Explicitly prompt/verify microphone permissions first to avoid premature network/audio errors
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately release stream since SpeechRecognition handles recording
        stream.getTracks().forEach((track) => track.stop());
      } catch (err: any) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setIsListening(false);
          setErrorType("not-allowed");
          setErrorMessage("માઇક્રોફોનની પરવાનગી (Permission) નકારી છે. બ્રાઉઝરના એડ્રેસ બારમાં Lock આઇકોન પર ક્લિક કરીને Microphone Allow કરો.");
          return;
        }
      }
    }

    try {
      const recognition = new SpeechRecClass();
      recognition.lang = langToUse;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
        setErrorType(null);
      };

      recognition.onresult = (event: any) => {
        let currentText = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);

        if (currentText.trim()) {
          const parsed = parseVoiceExpense(currentText);
          setParsedResult(parsed);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        const err = event.error || "unknown";
        setErrorType(err);

        if (err === "not-allowed") {
          setErrorMessage("માઇક્રોફોનની પરવાનગી (Permission) નકારી છે. બ્રાઉઝર સેટિંગ્સમાં જઈને Microphone Allow કરો.");
        } else if (err === "no-speech") {
          setErrorMessage("કોઈ અવાજ સંભળાયો નથી. ફરીથી માઇક દબાવીને સ્પષ્ટ અવાજે બોલો.");
        } else if (err === "network") {
          // Cloud speech synthesis service unavailable or blocked
          setErrorMessage(
            "બ્રાઉઝરની Google Speech સર્વિસ કનેક્ટ થઈ શકી નથી (Network Error). તમે નીચે એક જ વાક્યમાં સીધું લખી શકો છો — સિસ્ટમ આપોઆપ રકમ અને કેટેગરી અલગ પાડી દેશે!"
          );
        } else if (err === "audio-capture") {
          setErrorMessage("માઇક્રોફોન મળ્યો નથી અથવા માઇકમાં ક્ષતિ છે. માઇક ચેક કરો.");
        } else {
          setErrorMessage(`વોઇસ એરર: ${err}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setErrorMessage("માઇક શરૂ કરવામાં અડચણ આવી. ફરી પ્રયાસ કરો.");
    }
  }, [cleanupRecognition]);

  const startListening = useCallback(() => {
    startListeningWithLang(activeLang);
  }, [activeLang, startListeningWithLang]);

  useEffect(() => {
    if (isOpen) {
      const SpeechRecClass = getSpeechRecognitionClass();
      if (!SpeechRecClass) {
        setIsSupported(false);
      } else {
        setIsSupported(true);
        startListeningWithLang(activeLang);
      }
    } else {
      cleanupRecognition();
      setTranscript("");
      setParsedResult(null);
      setErrorMessage(null);
      setErrorType(null);
      setFallbackInput("");
    }
  }, [isOpen, activeLang, cleanupRecognition, startListeningWithLang]);

  // Handle fallback text submission
  const handleFallbackParse = (text: string) => {
    setFallbackInput(text);
    if (text.trim()) {
      const parsed = parseVoiceExpense(text);
      setParsedResult(parsed);
    } else {
      setParsedResult(null);
    }
  };

  if (!isOpen) return null;

  const handleApply = () => {
    if (parsedResult) {
      onApply(parsedResult);
      onClose();
    }
  };

  // ── Language-aware UI strings ──────────────────────────────────────
  const isEn = activeLang === "en-IN";
  const L = {
    title:          isEn ? "Voice Expense (Smart Entry)" : "વોઇસ એક્સપેન્સ (સ્માર્ટ એન્ટ્રી)",
    subtitle:       isEn ? "Speak or type — amount & category auto-filled" : "ગુજરાતીમાં બોલો કે લખો, ખર્ચ આપોઆપ ભરાઈ જશે",
    noSupport:      isEn ? "Web Speech API not supported" : "બ્રાઉઝરમાં Web Speech API સપોર્ટેડ નથી",
    noSupportDesc:  isEn
      ? "Google Speech Recognition is unavailable in your browser. You can still type a sentence below to auto-detect amount & category!"
      : "તમારા બ્રાઉઝરમાં ગૂગલ સ્પીચ રેકગ્નિશન ઉપલબ્ધ નથી. પરંતુ તમે નીચે એક જ વાક્ય લખીને પણ રકમ અને કેટેગરી ઓટો-ડીટેક્ટ કરી શકો છો!",
    listening:      isEn ? "Listening... Speak now!" : "હું સાંભળી રહ્યો છું... બોલો!",
    tapToSpeak:     isEn ? "Tap the mic and speak" : "માઇક્રોફોન પર ટેપ કરીને બોલો",
    example:        isEn ? "e.g. \u201cDAP fertilizer 1500 rupees\u201d or \u201cLabour 600\u201d" : "દા.ત. \u201cઆજે ડીએપી ખાતર ૧૫૦૦ રૂપિયા\u201d અથવા \u201cમજૂરી ૬૦૦\u201d",
    networkTip:     isEn
      ? "Tip: If you're on Brave/Firefox or offline, Google's server may be blocked. Just type in the box below — our smart parser will detect amount & category."
      : "ટીપ: જો તમે Brave/Firefox કે ઑફલાઇન હોવ ત્યારે ગૂગલ સર્વર બ્લોક હોય તો નીચેના બોક્સમાં સીધું લખી દો. આપણું સ્માર્ટ પાર્સર રકમ અને ખાતર/ડીઝલ જાતે શોધી લેશે.",
    youSaid:        isEn ? "You said:" : "તમે જે બોલ્યા:",
    liveSpeech:     isEn ? "Live Speech" : "લાઈવ સ્પીચ",
    quickTextLabel: isEn ? "Or type a sentence instead (Quick Entry)" : "બોલવાને બદલે એક વાક્યમાં લખો (ઝડપી એન્ટ્રી)",
    quickTextDesc:  isEn
      ? "Type in any language (e.g. \u201cfertilizer 1400\u201d or \u201clabour 800\u201d):"
      : "ગમે તે ભાષામાં લખો (દા.ત. \u201cયુરિયા 1400\u201d અથવા \u201cમજૂરી 800\u201d):",
    placeholder:    isEn ? "e.g. diesel 1500 or fertilizer 2000" : "દા.ત. ડીઝલ 1500 અથવા ખાતર 2000",
    clear:          isEn ? "Clear" : "સાફ",
    detectedTitle:  isEn ? "Detected Details:" : "ઓળખાયેલ વિગતો:",
    reviewHint:     isEn ? "Review & fill" : "તપાસીને ભરો",
    amountLabel:    isEn ? "Amount:" : "રકમ:",
    categoryLabel:  isEn ? "Category:" : "કેટેગરી:",
    notFound:       isEn ? "Not detected" : "ઓળખાઈ નથી",
    descLabel:      isEn ? "Description:" : "વર્ણન (Description):",
    cancel:         isEn ? "Cancel" : "રદ કરો",
    apply:          isEn ? "Fill in Form" : "ફોર્મમાં ભરો",
  };


  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[var(--color-surface)] rounded-t-3xl sm:rounded-[var(--radius-card)] p-6 shadow-2xl border border-[var(--color-border)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--color-crop-100)] text-[var(--color-crop-600)] flex items-center justify-center">
              <MicIcon size={18} />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-[var(--color-ink)]">{L.title}</h3>
              <p className="text-[11.5px] text-[var(--color-ink-faint)]">{L.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--color-paper-dim)] text-[var(--color-ink-faint)] flex items-center justify-center hover:text-[var(--color-ink)]"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Not supported fallback */}
        {!isSupported && (
          <div className="my-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
            <div className="flex items-start gap-2.5">
              <AlertIcon size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[14px] font-semibold">{L.noSupport}</p>
                <p className="text-[12.5px] text-amber-800 mt-1">{L.noSupportDesc}</p>
              </div>
            </div>
          </div>
        )}

        <div className="py-4 flex flex-col items-center text-center">
          {/* Language Toggle */}
          {isSupported && (
            <div className="flex items-center gap-1.5 p-1 bg-[var(--color-paper-dim)] rounded-full mb-4 text-[12px] font-medium">
              <button
                type="button"
                onClick={() => {
                  setActiveLang("gu-IN");
                  startListeningWithLang("gu-IN");
                }}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeLang === "gu-IN"
                    ? "bg-[var(--color-crop-500)] text-white shadow-xs font-semibold"
                    : "text-[var(--color-ink-soft)]"
                }`}
              >
                ગુજરાતી (gu-IN)
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveLang("en-IN");
                  startListeningWithLang("en-IN");
                }}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeLang === "en-IN"
                    ? "bg-[var(--color-crop-500)] text-white shadow-xs font-semibold"
                    : "text-[var(--color-ink-soft)]"
                }`}
              >
                English/Hinglish (en-IN)
              </button>
            </div>
          )}

          {/* Animated Mic Button */}
          {isSupported && (
            <div className="relative mb-3">
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full bg-[var(--color-crop-500)] opacity-25 animate-ping" />
                  <div className="absolute -inset-2 rounded-full bg-[var(--color-crop-500)] opacity-15 animate-pulse" />
                </>
              )}
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 ${
                  isListening
                    ? "bg-red-500 text-white scale-105"
                    : "bg-[var(--color-crop-500)] text-white hover:bg-[var(--color-crop-600)]"
                }`}
              >
                <MicIcon size={36} />
              </button>
            </div>
          )}

          <p className="text-[14px] font-semibold text-[var(--color-ink)]">
            {isListening ? L.listening : L.tapToSpeak}
          </p>
          <p className="text-[12px] text-[var(--color-ink-faint)] mt-1">{L.example}</p>

          {/* Error Message with Network troubleshooting guidance */}
          {errorMessage && (
            <div className="mt-3.5 p-3 rounded-xl bg-red-50 text-red-800 text-[12.5px] border border-red-200 w-full text-left space-y-1.5">
              <div className="flex items-start gap-2">
                <AlertIcon size={16} className="shrink-0 text-red-500 mt-0.5" />
                <span className="font-medium leading-relaxed">{errorMessage}</span>
              </div>
              {errorType === "network" && (
                <div className="mt-2 pt-2 border-t border-red-200/60 text-[11.5px] text-red-700 leading-normal flex items-start gap-1.5">
                  <LightbulbIcon size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  <span>{L.networkTip}</span>
                </div>
              )}
            </div>
          )}

          {/* Real-time Voice Transcript Display */}
          {transcript && (
            <div className="mt-3.5 w-full text-left bg-[var(--color-crop-50)]/50 p-3 rounded-xl border border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11.5px] font-semibold text-[var(--color-ink-faint)]">{L.youSaid}</span>
                <span className="text-[11px] text-[var(--color-crop-600)] font-medium">{L.liveSpeech}</span>
              </div>
              <p className="text-[14.5px] font-medium text-[var(--color-ink)] italic">&ldquo;{transcript}&rdquo;</p>
            </div>
          )}

          {/* 100% Reliable Quick-Text Smart Input (Fallback & Alternative) */}
          <div className="mt-4 w-full text-left bg-[var(--color-paper-dim)] p-3.5 rounded-xl border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12.5px] font-bold text-[var(--color-ink)] flex items-center gap-1.5">
                <KeyboardIcon size={15} className="text-[var(--color-crop-600)] shrink-0" />
                {L.quickTextLabel}
              </span>
            </div>
            <p className="text-[11.5px] text-[var(--color-ink-faint)] mb-2">{L.quickTextDesc}</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={fallbackInput}
                onChange={(e) => handleFallbackParse(e.target.value)}
                placeholder={L.placeholder}
                className="flex-1 h-10 px-3 bg-white border border-[var(--color-border)] rounded-lg text-[13.5px] outline-none focus:border-[var(--color-crop-500)]"
              />
              {fallbackInput && (
                <button
                  type="button"
                  onClick={() => handleFallbackParse("")}
                  className="px-2.5 text-[12px] text-[var(--color-ink-faint)] hover:text-red-500"
                >
                  {L.clear}
                </button>
              )}
            </div>
          </div>

          {/* Parsed Result Preview */}
          {parsedResult && (
            <div className="mt-4 w-full bg-[var(--color-surface)] border-2 border-[var(--color-crop-400)] rounded-xl p-4 text-left shadow-sm">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-[var(--color-border)]">
                <span className="text-[13px] font-bold text-[var(--color-crop-700)]">{L.detectedTitle}</span>
                <span className="text-[11px] text-[var(--color-ink-faint)]">{L.reviewHint}</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-[13.5px]">
                <div className="bg-[var(--color-paper-dim)] p-2 rounded-lg">
                  <span className="text-[11.5px] text-[var(--color-ink-faint)] block">{L.amountLabel}</span>
                  <strong className="text-[16px] text-[var(--color-crop-700)] font-bold">
                    {parsedResult.amount !== undefined ? `₹${parsedResult.amount.toLocaleString("en-IN")}` : L.notFound}
                  </strong>
                </div>
                <div className="bg-[var(--color-paper-dim)] p-2 rounded-lg">
                  <span className="text-[11.5px] text-[var(--color-ink-faint)] block">{L.categoryLabel}</span>
                  <strong className="text-[15px] text-[var(--color-ink)] font-semibold">
                    {parsedResult.matchedCategoryLabel || L.notFound}
                  </strong>
                </div>
              </div>

              <div className="mt-3">
                <label className="text-[11.5px] text-[var(--color-ink-faint)] block mb-1">{L.descLabel}</label>
                <input
                  type="text"
                  value={parsedResult.description}
                  onChange={(e) =>
                    setParsedResult({ ...parsedResult, description: e.target.value })
                  }
                  className="w-full h-9 px-2.5 bg-white border border-[var(--color-border)] rounded-lg text-[13.5px] outline-none focus:border-[var(--color-crop-500)]"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-5 w-full flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-[var(--color-border)] font-semibold text-[14px] text-[var(--color-ink-soft)] active:bg-[var(--color-paper-dim)]"
            >
              {L.cancel}
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!parsedResult}
              className={`flex-1 h-11 rounded-xl font-semibold text-[14px] shadow-sm transition-all ${
                parsedResult
                  ? "bg-[var(--color-crop-500)] hover:bg-[var(--color-crop-600)] text-white active:scale-[0.98]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5"><CheckIcon size={16} />{L.apply}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
