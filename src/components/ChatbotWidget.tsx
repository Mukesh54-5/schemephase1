import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  X,
  Loader2,
  Mic,
  MicOff,
  Search,
  Volume2,
  VolumeX,
  ArrowRight,
  Sparkles,
  Landmark,
  Sprout,
  Compass,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { TranslatedText } from '../context/DynamicTranslationContext';
import { getNormalizedLang, tEnum } from '../translations/i18n';
import {
  fetchChatHistory,
  searchWebsite,
  sendChatMessage,
  transcribeVoiceAudio,
} from '../services/api';
import type { ChatMessageItem, WebsiteSearchResults } from '../types';
import { ChatbotIcon } from './ChatbotIcon';

interface BrowserSpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [altIndex: number]: { transcript: string };
    };
  };
}

interface BrowserSpeechRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((ev: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function getOrCreateSessionKey(): string {
  const existing = sessionStorage.getItem('farmer_chat_session_key');
  if (existing) return existing;
  const created = `guest_${Math.random().toString(36).slice(2, 11)}`;
  sessionStorage.setItem('farmer_chat_session_key', created);
  return created;
}

function getSpeechLocale(lang: string): string {
  if (lang === 'hi') return 'hi-IN';
  if (lang === 'kn') return 'kn-IN';
  return 'en-IN';
}

export const ChatbotWidget: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { t, i18n } = useTranslation();
  const currentLang = getNormalizedLang(i18n.language);
  const { token } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(embedded);
  const [mode, setMode] = useState<'chat' | 'search'>('chat');

  // Chat state
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionKey] = useState(getOrCreateSessionKey);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WebsiteSearchResults | null>(null);
  const [searching, setSearching] = useState(false);

  // Voice Input & Speech Synthesis state
  const [listeningTarget, setListeningTarget] = useState<'chat' | 'search' | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!open) return;
    fetchChatHistory(sessionKey, token)
      .then((hist) => {
        if (hist.length > 0) setMessages(hist);
      })
      .catch(() => {});
  }, [open, sessionKey, token]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  // Run website search with debounce when in Search mode
  useEffect(() => {
    if (!open || mode !== 'search') return;
    let active = true;
    const timer = setTimeout(() => {
      setSearching(true);
      searchWebsite(searchQuery, currentLang)
        .then((res) => {
          if (active) setSearchResults(res);
        })
        .catch(() => {})
        .finally(() => {
          if (active) setSearching(false);
        });
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [open, mode, searchQuery, currentLang]);

  // Clean up speech/recording on unmount
  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      try {
        mediaRecorderRef.current?.stop();
      } catch {
        // ignore
      }
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = useCallback(
    (text: string, idx: number | null = null) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();

      if (idx !== null && speakingIdx === idx) {
        setSpeakingIdx(null);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getSpeechLocale(currentLang);
      utterance.rate = 1;
      utterance.onend = () => setSpeakingIdx(null);
      utterance.onerror = () => setSpeakingIdx(null);
      setSpeakingIdx(idx);
      window.speechSynthesis.speak(utterance);
    },
    [currentLang, speakingIdx]
  );

  const submitChatText = useCallback(
    async (textToSend: string) => {
      const trimmed = textToSend.trim();
      if (!trimmed || sending) return;

      setMode('chat');
      setError(null);
      setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
      setInput('');
      setSending(true);

      try {
        const result = await sendChatMessage(
          { message: trimmed, language: currentLang, sessionKey },
          token
        );
        setMessages((prev) => {
          const next = [
            ...prev,
            { role: 'assistant' as const, content: result.reply, links: result.links },
          ];
          if (autoSpeak) {
            speakText(result.reply, next.length - 1);
          }
          return next;
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : t('chatbot.reachError')
        );
      } finally {
        setSending(false);
      }
    },
    [sending, currentLang, sessionKey, token, autoSpeak, speakText, t]
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitChatText(input);
  };

  const stopVoiceCapture = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    recognitionRef.current = null;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    setListeningTarget(null);
  }, []);

  const startFallbackRecording = async (target: 'chat' | 'search') => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setVoiceFeedback(t('chatbot.micUnsupported'));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      mediaChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) mediaChunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((trItem) => trItem.stop());
        mediaStreamRef.current = null;
        setListeningTarget(null);

        const audioBlob = new Blob(mediaChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        if (audioBlob.size < 400) return;

        setTranscribing(true);
        setVoiceFeedback(t('chatbot.transcribingVoice'));
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const res = String(reader.result || '');
              const idx = res.indexOf(',');
              resolve(idx >= 0 ? res.slice(idx + 1) : res);
            };
            reader.onerror = () => reject(new Error(t('chatbot.transcribeFailed')));
            reader.readAsDataURL(audioBlob);
          });

          const transcript = await transcribeVoiceAudio(
            {
              audioBase64: base64,
              mimeType: recorder.mimeType || 'audio/webm',
              language: currentLang,
            },
            token
          );

          if (transcript) {
            if (target === 'search') {
              setSearchQuery(transcript);
            } else {
              await submitChatText(transcript);
            }
          } else {
            setVoiceFeedback(t('chatbot.noSpeechCaught'));
          }
        } catch (err) {
          setVoiceFeedback(
            err instanceof Error ? err.message : t('chatbot.transcribeFailed')
          );
        } finally {
          setTranscribing(false);
        }
      };

      recorder.start();
      setListeningTarget(target);
      setVoiceFeedback(t('chatbot.recordingVoice'));
    } catch {
      setVoiceFeedback(t('chatbot.micDenied'));
      setListeningTarget(null);
    }
  };

  const toggleVoiceInput = (target: 'chat' | 'search') => {
    setVoiceFeedback(null);
    setError(null);

    if (listeningTarget) {
      stopVoiceCapture();
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => BrowserSpeechRecognition;
      webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      void startFallbackRecording(target);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = getSpeechLocale(currentLang);
      recognition.interimResults = true;
      recognition.continuous = false;

      let latestTranscript = '';

      recognition.onresult = (event) => {
        let fullText = '';
        for (let i = 0; i < event.results.length; i++) {
          fullText += event.results[i][0].transcript;
        }
        latestTranscript = fullText.trim();
        if (target === 'search') {
          setSearchQuery(latestTranscript);
        } else {
          setInput(latestTranscript);
        }
      };

      recognition.onerror = (ev) => {
        recognitionRef.current = null;
        setListeningTarget(null);
        if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
          setVoiceFeedback(t('chatbot.micBlocked'));
        } else if (ev.error === 'network' || ev.error === 'audio-capture') {
          void startFallbackRecording(target);
        } else {
          setVoiceFeedback(t('chatbot.listeningStopped'));
        }
      };

      recognition.onend = () => {
        recognitionRef.current = null;
        setListeningTarget(null);
        setVoiceFeedback(null);
        if (target === 'chat' && latestTranscript) {
          void submitChatText(latestTranscript);
        }
      };

      recognitionRef.current = recognition;
      setListeningTarget(target);
      setVoiceFeedback(t('chatbot.listeningNow'));
      recognition.start();
    } catch {
      void startFallbackRecording(target);
    }
  };

  const navigateToPath = (path: string) => {
    navigate(path);
    if (!embedded) setOpen(false);
  };

  const quickPrompts = t('chatbot.quickPrompts', { returnObjects: true }) as string[];

  const chatBody = (
    <div
      className={`flex flex-col bg-white border border-[#E5E7EB] overflow-hidden ${
        embedded
          ? 'rounded-xl h-[600px] w-full'
          : 'rounded-xl shadow-2xl w-[94vw] sm:w-[430px] h-[560px]'
      }`}
    >
      {/* Header with Chatbot Icon & Voice Reply Toggle */}
      <div className="bg-[#17613A] text-white px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-full bg-white p-1 shrink-0 flex items-center justify-center shadow-sm">
            <ChatbotIcon className="w-8 h-8 text-[#17613A]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold truncate">{t('chatbot.assistantTitle')}</h3>
            <p className="text-[11px] text-white/80 truncate">
              {t('chatbot.assistantSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              const next = !autoSpeak;
              setAutoSpeak(next);
              if (!next && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                setSpeakingIdx(null);
              }
            }}
            title={autoSpeak ? t('chatbot.muteTitle') : t('chatbot.speakTitle')}
            aria-label={autoSpeak ? t('chatbot.muteAria') : t('chatbot.enableVoiceAria')}
            className={`p-1.5 rounded-lg transition-colors ${
              autoSpeak ? 'bg-[#F47721] text-white' : 'hover:bg-[#207747] text-white/90'
            }`}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {!embedded && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('chatbot.closeAria')}
              className="p-1.5 rounded-lg hover:bg-[#207747] text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mode Switcher Tabs: AI Voice Chat vs Search Website */}
      <div className="bg-[#F5F8F5] border-b border-[#E5E7EB] px-3 py-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode('chat')}
          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            mode === 'chat'
              ? 'bg-[#17613A] text-white'
              : 'bg-white text-[#303030] border border-[#E5E7EB] hover:border-[#17613A]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t('chatbot.tabChat')}</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('search')}
          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            mode === 'search'
              ? 'bg-[#F47721] text-white'
              : 'bg-white text-[#303030] border border-[#E5E7EB] hover:border-[#F47721]'
          }`}
        >
          <Search className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t('chatbot.tabSearch')}</span>
        </button>
      </div>

      {/* Voice Status Banner */}
      {(voiceFeedback || transcribing) && (
        <div className="bg-amber-50 border-b border-amber-200 px-3.5 py-2 text-xs font-medium text-amber-900 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            {(listeningTarget || transcribing) && (
              <span className="w-2 h-2 rounded-full bg-[#F47721] animate-ping shrink-0" />
            )}
            <span>{voiceFeedback}</span>
          </span>
          {listeningTarget && (
            <button
              type="button"
              onClick={stopVoiceCapture}
              className="px-2 py-0.5 text-[11px] font-bold bg-white border border-amber-300 rounded text-amber-900"
            >
              {t('chatbot.stopBtn')}
            </button>
          )}
        </div>
      )}

      {/* MODE 1: AI & VOICE CHAT */}
      {mode === 'chat' ? (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F5F8F5]">
            {messages.length === 0 && (
              <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 text-sm text-[#303030]">
                <div className="flex items-center gap-2.5">
                  <ChatbotIcon className="w-8 h-8 shrink-0 text-[#17613A]" />
                  <div>
                    <p className="font-bold text-[#17613A]">
                      {t('chatbot.welcomeTitle')}
                    </p>
                    <p className="text-[11px] text-[#303030]/75">
                      {t('chatbot.welcomeVoiceHint')}
                    </p>
                  </div>
                </div>
                <p className="mt-2.5 text-xs text-[#303030]/85 leading-relaxed">
                  {t('chatbot.welcomeDesc')}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {quickPrompts.map((qp) => (
                    <button
                      key={qp}
                      type="button"
                      onClick={() => void submitChatText(qp)}
                      className="text-left text-xs px-2.5 py-1.5 bg-[#F5F8F5] hover:bg-[#17613A] hover:text-white border border-[#E5E7EB] rounded-lg transition-colors"
                    >
                      {qp}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-white border border-[#E5E7EB] p-0.5 shrink-0 mt-0.5 flex items-center justify-center">
                    <ChatbotIcon className="w-6 h-6 text-[#17613A]" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#17613A] text-white whitespace-pre-wrap'
                      : 'bg-white border border-[#E5E7EB] text-[#303030]'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {msg.role === 'assistant' && (
                    <div className="mt-2 pt-2 border-t border-[#E5E7EB]/80 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => speakText(msg.content, i)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#17613A] hover:text-[#F47721]"
                      >
                        {speakingIdx === i ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" />
                            <span>{t('chatbot.stopAudio')}</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>{t('chatbot.listen')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {msg.role === 'assistant' && msg.links && msg.links.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.links.map((lnk) => (
                        <button
                          key={lnk.path + lnk.label}
                          type="button"
                          onClick={() => navigateToPath(lnk.path)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 bg-[#F5F8F5] hover:bg-[#17613A] text-[#17613A] hover:text-white border border-[#17613A]/25 rounded-lg transition-colors"
                        >
                          <span>{lnk.label}</span>
                          <ArrowRight className="w-3 h-3 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex items-start gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-white border border-[#E5E7EB] p-0.5 shrink-0 flex items-center justify-center">
                  <ChatbotIcon className="w-6 h-6 text-[#17613A]" />
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-lg px-3.5 py-2.5 text-sm text-[#17613A] inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('chatbot.thinking')}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-2.5">
                {error}
              </div>
            )}
          </div>

          {/* Chat + Voice Mic Input */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-[#E5E7EB] flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => toggleVoiceInput('chat')}
              disabled={sending || transcribing}
              aria-label={
                listeningTarget === 'chat' ? t('chatbot.stopVoiceAria') : t('chatbot.askVoiceAria')
              }
              title={t('chatbot.voiceTitle')}
              className={`p-2 rounded-lg border transition-colors shrink-0 ${
                listeningTarget === 'chat'
                  ? 'bg-red-600 text-white border-red-600 animate-pulse'
                  : 'bg-[#F5F8F5] hover:bg-[#E6EFE9] text-[#17613A] border-[#E5E7EB]'
              }`}
            >
              {listeningTarget === 'chat' ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chatbot.chatPlaceholder')}
              className="flex-1 min-w-0 px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#17613A]"
            />

            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label={t('chatbot.sendAria')}
              className="px-3.5 py-2 bg-[#F47721] hover:bg-[#d96312] disabled:opacity-50 text-white rounded-lg text-sm font-semibold inline-flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{t('chatbot.sendBtn')}</span>
            </button>
          </form>
        </>
      ) : (
        /* MODE 2: INSTANT WEBSITE SEARCH + VOICE SEARCH */
        <div className="flex-1 flex flex-col min-h-0 bg-[#F5F8F5]">
          <div className="p-3 bg-white border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Search
                  className="w-4 h-4 text-[#303030]/50 absolute left-3 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('chatbot.searchPlaceholder')}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#17613A]"
                />
              </div>

              <button
                type="button"
                onClick={() => toggleVoiceInput('search')}
                disabled={transcribing}
                aria-label={listeningTarget === 'search' ? t('chatbot.stopVoiceSearchAria') : t('chatbot.searchByVoiceAria')}
                title={t('chatbot.voiceSearchTitle')}
                className={`p-2 rounded-lg border transition-colors shrink-0 ${
                  listeningTarget === 'search'
                    ? 'bg-red-600 text-white border-red-600 animate-pulse'
                    : 'bg-[#F5F8F5] hover:bg-[#E6EFE9] text-[#F47721] border-[#E5E7EB]'
                }`}
              >
                {listeningTarget === 'search' ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            </div>
            {searchQuery.trim() && (
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] text-[#303030]/70">
                  {searching ? t('chatbot.searchingWebsite') : t('chatbot.instantResults')}
                </span>
                <button
                  type="button"
                  onClick={() => void submitChatText(`Explain "${searchQuery.trim()}" from KRISHI SANGRAH`)}
                  className="text-[11px] font-bold text-[#17613A] hover:text-[#F47721] inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{t('chatbot.askAiAbout', { query: searchQuery.trim() })}</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
            {searching && !searchResults ? (
              <div className="flex items-center justify-center py-8 text-xs text-[#17613A] gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('chatbot.searchingBrand')}</span>
              </div>
            ) : searchResults ? (
              <>
                {searchResults.pages.length === 0 &&
                  searchResults.schemes.length === 0 &&
                  searchResults.agriculture.length === 0 && (
                    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 text-center text-sm">
                      <p className="font-semibold text-[#17613A]">
                        {t('chatbot.noMatches', { query: searchResults.query })}
                      </p>
                      <button
                        type="button"
                        onClick={() => void submitChatText(searchResults.query)}
                        className="mt-3 px-4 py-2 bg-[#17613A] text-white text-xs font-semibold rounded-lg"
                      >
                        {t('chatbot.askAiInstead')}
                      </button>
                    </div>
                  )}

                {/* Website Pages & Tools */}
                {searchResults.pages.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#F47721] mb-2 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5" />
                      <span>{t('chatbot.pagesAndTools')}</span>
                    </h4>
                    <div className="space-y-2">
                      {searchResults.pages.map((p) => (
                        <button
                          key={p.path}
                          type="button"
                          onClick={() => navigateToPath(p.path)}
                          className="w-full text-left bg-white hover:border-[#17613A] border border-[#E5E7EB] rounded-lg p-3 transition-colors flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#17613A] truncate">
                              <TranslatedText text={p.title} />
                            </div>
                            <div className="text-[11px] text-[#303030]/80 line-clamp-1 mt-0.5">
                              <TranslatedText text={p.description} />
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#F47721] shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Government Schemes */}
                {searchResults.schemes.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#17613A] mb-2 flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5" />
                      <span>{t('chatbot.govSchemesCount', { count: searchResults.schemes.length })}</span>
                    </h4>
                    <div className="space-y-2">
                      {searchResults.schemes.map((s) => (
                        <div
                          key={s.id}
                          className="bg-white border border-[#E5E7EB] rounded-lg p-3 flex items-start justify-between gap-2"
                        >
                          <button
                            type="button"
                            onClick={() => navigateToPath(`/schemes/${s.slug}`)}
                            className="text-left min-w-0 flex-1"
                          >
                            <div className="text-[10px] font-bold text-[#207747] uppercase">
                              {tEnum(t, 'govLevels', s.governmentLevel)} · {tEnum(t, 'schemeCategories', s.category)}
                            </div>
                            <div className="text-xs font-bold text-[#17613A] hover:underline mt-0.5">
                              <TranslatedText text={s.name} />
                            </div>
                            <div className="text-[11px] text-[#303030]/80 line-clamp-2 mt-0.5">
                              <TranslatedText text={s.benefits} />
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void submitChatText(`Tell me full benefits, eligibility, and documents for ${s.name}`)
                            }
                            className="px-2 py-1 text-[10px] font-bold bg-[#F5F8F5] hover:bg-[#17613A] text-[#17613A] hover:text-white border border-[#E5E7EB] rounded shrink-0"
                          >
                            {t('chatbot.askAiShort')}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Agriculture Knowledge Items */}
                {searchResults.agriculture.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#207747] mb-2 flex items-center gap-1.5">
                      <Sprout className="w-3.5 h-3.5" />
                      <span>{t('chatbot.agriKnowledgeCount', { count: searchResults.agriculture.length })}</span>
                    </h4>
                    <div className="space-y-2">
                      {searchResults.agriculture.map((a) => (
                        <div
                          key={a.id}
                          className="bg-white border border-[#E5E7EB] rounded-lg p-2.5 flex items-center gap-2.5"
                        >
                          {a.imageUrl && (
                            <img
                              src={a.imageUrl}
                              alt={a.title}
                              referrerPolicy="no-referrer"
                              className="w-11 h-11 rounded object-cover border border-[#E5E7EB] shrink-0"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => navigateToPath(`/agriculture/${a.section}`)}
                            className="text-left min-w-0 flex-1"
                          >
                            <div className="text-[10px] font-bold text-[#F47721] uppercase">
                              {t(`agriculture.sections.${a.section}.label`, { defaultValue: a.section })}
                            </div>
                            <div className="text-xs font-bold text-[#17613A] hover:underline truncate">
                              <TranslatedText text={a.title} />
                            </div>
                            <div className="text-[11px] text-[#303030]/80 line-clamp-1">
                              <TranslatedText text={a.summary} />
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void submitChatText(`Tell me complete details about ${a.title} (${a.section})`)
                            }
                            className="px-2 py-1 text-[10px] font-bold bg-[#F5F8F5] hover:bg-[#17613A] text-[#17613A] hover:text-white border border-[#E5E7EB] rounded shrink-0"
                          >
                            {t('chatbot.askAiShort')}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );

  if (embedded) return chatBody;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        chatBody
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t('chatbot.openAssistantAria')}
          className="group inline-flex items-center gap-2.5 pl-2 pr-4 py-2 bg-[#F47721] hover:bg-[#d96312] text-white font-bold text-sm rounded-full shadow-xl border-2 border-white/90 transition-all"
        >
          <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <ChatbotIcon className="w-8 h-8 text-[#17613A]" />
          </span>
          <span className="flex flex-col items-start leading-tight text-left">
            <span>{t('chatbot.askBrandBtn')}</span>
            <span className="text-[10px] font-medium text-white/90 inline-flex items-center gap-1">
              <Mic className="w-2.5 h-2.5" aria-hidden="true" />
              <span>{t('chatbot.voiceAndSearchBadge')}</span>
            </span>
          </span>
        </button>
      )}
    </div>
  );
};
