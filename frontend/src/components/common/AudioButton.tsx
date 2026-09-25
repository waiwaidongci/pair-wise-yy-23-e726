import { useEffect, useRef, useState } from "react";
import type { BrailleSymbol } from "../../types/BrailleSymbol";

interface AudioButtonProps {
  symbol: BrailleSymbol;
  autoPlay?: boolean;
}

/**
 * 听写模拟：优先用浏览器内置 speechSynthesis 朗读，
 * 无语音引擎时退化为可点击的读音提示（不接任何第三方服务）。
 */
export function AudioButton({ symbol, autoPlay = false }: AudioButtonProps) {
  const [supported, setSupported] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const spokenRef = useRef(false);

  const speak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      symbol.category === "PUNCTUATION" ? symbol.pinyin : symbol.letter
    );
    utterance.lang = symbol.category === "PUNCTUATION" ? "zh-CN" : "en-US";
    utterance.rate = 0.85;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (autoPlay && !spokenRef.current) {
      spokenRef.current = true;
      const timer = window.setTimeout(speak, 350);
      return () => window.clearTimeout(timer);
    }
  }, [autoPlay]);

  if (!supported) {
    return (
      <button type="button" className="btn btn-audio" onClick={speak}>
        🔊 读音提示：{symbol.pinyin}
      </button>
    );
  }
  return (
    <button type="button" className={`btn btn-audio${speaking ? " playing" : ""}`} onClick={speak}>
      {speaking ? "🔊 播放中…" : "🔈 点击再听一次"}
    </button>
  );
}
