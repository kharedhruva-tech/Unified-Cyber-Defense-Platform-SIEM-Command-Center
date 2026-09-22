import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Bot, X, Send, RefreshCw, Zap, ShieldAlert, 
  Terminal, Copy, Check, Mic, MicOff, Download, Trash2, 
  Activity, Layers, Play, Radio, Newspaper, ChevronDown, ChevronUp
} from 'lucide-react';
import { AiCopilotService, SiemService } from '../../services/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actions?: {
    type: 'contain_ip' | 'scan_subnet' | 'run_eval';
    label: string;
    payload: string;
  }[];
}

interface NewsItem {
  id: string;
  type: 'alert' | 'log';
  title: string;
  detail: string;
  severity?: string;
  rawId?: number;
}

interface AiSecurityCopilotProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule?: string;
}

const MODULE_OPTIONS = [
  { id: 'dashboard', label: 'Overview Dashboard' },
  { id: 'threat_detection', label: 'Threat Detection' },
  { id: 'incidents', label: 'Incidents & SOAR' },
  { id: 'logs', label: 'Log Analytics' },
  { id: 'network', label: 'Network Intelligence' },
  { id: 'hardening', label: 'System Hardening' },
];

export const AiSecurityCopilot: React.FC<AiSecurityCopilotProps> = ({ 
  isOpen, 
  onClose, 
  activeModule = 'dashboard' 
}) => {
  const [selectedModule, setSelectedModule] = useState<string>(activeModule);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "### 🤖 Welcome to AI Security Copilot!\n\nI am your real-time **Plain-English Threat Intelligence & Remediation Assistant**. Ask me anything about live alerts, log anomalies, IP reputation, or incident containment playbooks.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [actionStatus, setActionStatus] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Live Telemetry News State
  const [liveNews, setLiveNews] = useState<NewsItem[]>([]);
  const [showNewsFeed, setShowNewsFeed] = useState<boolean>(false);
  const [currentTickerIdx, setCurrentTickerIdx] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (activeModule) {
      setSelectedModule(activeModule);
    }
  }, [activeModule]);

  // Auto-scroll to bottom on message updates
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Poll live telemetry logs & alerts for the News Ticker
  useEffect(() => {
    if (!isOpen) return;

    const fetchLiveTelemetry = async () => {
      try {
        const [logsRes, alertsRes] = await Promise.allSettled([
          SiemService.getLogs('ALL', 6),
          SiemService.getAlerts()
        ]);

        const items: NewsItem[] = [];

        if (alertsRes.status === 'fulfilled' && Array.isArray(alertsRes.value.data)) {
          alertsRes.value.data.slice(0, 4).forEach((a: any) => {
            items.push({
              id: `alert-${a.id}`,
              type: 'alert',
              title: `[ALERT #${a.id}] ${a.rule_name}`,
              detail: `${a.severity || 'High'} Severity — ${a.evidence || 'Security rule triggered'}`,
              severity: a.severity || 'High',
              rawId: a.id
            });
          });
        }

        if (logsRes.status === 'fulfilled' && Array.isArray(logsRes.value.data)) {
          logsRes.value.data.slice(0, 4).forEach((l: any) => {
            items.push({
              id: `log-${l.id}`,
              type: 'log',
              title: `[LOG ${l.log_type}] ${l.source_ip || 'Local Host'}`,
              detail: l.message ? (l.message.length > 70 ? l.message.substring(0, 70) + '...' : l.message) : 'Log telemetry event',
            });
          });
        }

        if (items.length > 0) {
          setLiveNews(items);
        }
      } catch (err) {
        console.error('Error fetching live telemetry news feed:', err);
      }
    };

    fetchLiveTelemetry();
    const interval = setInterval(fetchLiveTelemetry, 6000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Rotate ticker item automatically
  useEffect(() => {
    if (liveNews.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentTickerIdx(prev => (prev + 1) % liveNews.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [liveNews]);

  // Extract actionable recommendations from AI text
  const extractActionsFromText = (text: string) => {
    const actions: { type: 'contain_ip' | 'scan_subnet' | 'run_eval'; label: string; payload: string }[] = [];
    
    // IP extraction regex
    const ipMatch = text.match(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/);
    if (ipMatch && (text.toLowerCase().includes('block') || text.toLowerCase().includes('contain') || text.toLowerCase().includes('ip'))) {
      actions.push({
        type: 'contain_ip',
        label: `Contain IP ${ipMatch[0]}`,
        payload: ipMatch[0]
      });
    }

    if (text.toLowerCase().includes('scan') || text.toLowerCase().includes('nmap')) {
      actions.push({
        type: 'scan_subnet',
        label: 'Run Asset Discovery Scan',
        payload: '192.168.1.0/24'
      });
    }

    if (text.toLowerCase().includes('sigma') || text.toLowerCase().includes('evaluat')) {
      actions.push({
        type: 'run_eval',
        label: 'Trigger SIGMA Rules Evaluation',
        payload: 'all'
      });
    }

    return actions;
  };

  const handleSendPrompt = async (promptText?: string) => {
    const textToSend = (promptText || inputPrompt).trim();
    if (!textToSend || isLoading) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { 
      id: `msg-${Date.now()}`, 
      sender: 'user', 
      text: textToSend, 
      timestamp: userTime 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await AiCopilotService.askCopilot(textToSend, selectedModule);
      const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const rawResponse = res.data.response || "No response received from AI copilot.";
      
      const aiMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: rawResponse,
        timestamp: aiTime,
        actions: extractActionsFromText(rawResponse)
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: "⚠️ **Error connecting to AI Copilot Engine**. Please verify your backend server connection.",
        timestamp: aiTime
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Click on a live news ticker item to auto-query AI
  const handleNewsItemClick = (item: NewsItem) => {
    if (item.type === 'alert' && item.rawId) {
      handleSendPrompt(`Analyze Alert #${item.rawId} (${item.title}) and recommend immediate remediation.`);
    } else {
      handleSendPrompt(`Investigate log anomaly: ${item.title} — ${item.detail}`);
    }
  };

  // Execute interactive one-click actions
  const handleExecuteAction = async (action: { type: string; payload: string }) => {
    setActionStatus(null);
    try {
      if (action.type === 'contain_ip') {
        await SiemService.containIp(action.payload);
        setActionStatus({ msg: `Successfully contained IP ${action.payload} on firewall.`, type: 'success' });
      } else if (action.type === 'scan_subnet') {
        await SiemService.runSubnetScan(action.payload);
        setActionStatus({ msg: `Initiated asset discovery scan on ${action.payload}.`, type: 'success' });
      } else if (action.type === 'run_eval') {
        await SiemService.runEvaluation();
        setActionStatus({ msg: `Triggered full SIGMA rule evaluation engine.`, type: 'success' });
      }
    } catch (err: any) {
      setActionStatus({ msg: `Action failed: ${err.message || 'Server error'}`, type: 'error' });
    }
    setTimeout(() => setActionStatus(null), 4000);
  };

  // Voice-to-Text Dictation
  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputPrompt(prev => prev ? `${prev} ${transcript}` : transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Copy text helper
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(id);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Export Chat Log as Markdown
  const handleExportChat = () => {
    const chatLog = messages.map(m => 
      `### [${m.timestamp}] ${m.sender.toUpperCase()}\n${m.text}\n`
    ).join('\n---\n\n');

    const blob = new Blob([chatLog], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOC_Copilot_Report_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear Chat History
  const handleClearChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'assistant',
        text: "### 🤖 Conversation Reset\n\nHow else can I assist with your SOC telemetry and threat response?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Render formatted markdown and multi-line code blocks
  const renderFormattedMarkdown = (rawText: string) => {
    const parts = rawText.split(/(```[\s\S]*?```)/g);

    return parts.map((part, pIdx) => {
      if (part.startsWith('```')) {
        const lines = part.split('\n');
        const lang = lines[0].replace('```', '').trim() || 'bash';
        const codeContent = lines.slice(1, -1).join('\n') || lines.slice(1).join('\n').replace(/```$/, '');
        const blockId = `code-${pIdx}`;

        return (
          <div key={pIdx} className="my-3 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-lg font-mono text-[11px]">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px]">
              <span className="font-bold text-emerald-400 uppercase tracking-wider">{lang}</span>
              <button
                onClick={() => handleCopyText(codeContent, blockId)}
                className="flex items-center gap-1 hover:text-white transition text-[10px] text-slate-400"
              >
                {copiedIdx === blockId ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-emerald-300 leading-relaxed">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }

      // Regular text block processing
      const lines = part.split('\n');
      return (
        <div key={pIdx} className="space-y-1.5">
          {lines.map((line, lIdx) => {
            if (!line.trim()) return <div key={lIdx} className="h-1" />;

            if (line.startsWith('### ')) {
              return (
                <h4 key={lIdx} className="font-bold text-indigo-900 text-xs sm:text-sm border-b border-indigo-100 pb-1 mt-2 mb-1 flex items-center gap-1.5">
                  <span>{line.replace('### ', '')}</span>
                </h4>
              );
            }

            if (line.startsWith('## ')) {
              return (
                <h3 key={lIdx} className="font-black text-indigo-950 text-sm mt-3 mb-1">
                  {line.replace('## ', '')}
                </h3>
              );
            }

            // Parse bold & inline code formatting
            const formattedSpan = line.split(/(\*\*.*?\*\*|`.*?`)/g).map((segment, sIdx) => {
              if (segment.startsWith('**') && segment.endsWith('**')) {
                return <strong key={sIdx} className="font-bold text-slate-900">{segment.slice(2, -2)}</strong>;
              }
              if (segment.startsWith('`') && segment.endsWith('`')) {
                return (
                  <code key={sIdx} className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-indigo-600 border border-slate-200">
                    {segment.slice(1, -1)}
                  </code>
                );
              }
              return segment;
            });

            if (line.startsWith('• ') || line.startsWith('- ')) {
              return (
                <div key={lIdx} className="flex items-start gap-2 pl-1 text-slate-700">
                  <span className="text-indigo-500 font-bold">•</span>
                  <span>{formattedSpan}</span>
                </div>
              );
            }

            return <p key={lIdx} className="text-slate-700 leading-relaxed">{formattedSpan}</p>;
          })}
        </div>
      );
    });
  };

  if (!isOpen) return null;

  const currentTickerItem = liveNews[currentTickerIdx];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col transition-all duration-300">
      {/* Drawer Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400">
            <Sparkles className="h-5 w-5 animate-pulse text-indigo-300" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black tracking-wider flex items-center gap-2">
              AI SECURITY COPILOT
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold uppercase">
                GPT-SOC ACTIVE
              </span>
            </h2>
            <p className="text-[10px] text-slate-400">Plain-English Threat Analysis & Remediation</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleExportChat}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-emerald-400 transition"
            title="Export Conversation Log (.md)"
          >
            <Download className="h-4 w-4" />
          </button>
          <button 
            onClick={handleClearChat}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition"
            title="Clear Chat Thread"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button 
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Module Context Filter Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-400">Context Focus:</span>
        </div>
        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="bg-slate-800 text-indigo-300 border border-slate-700 text-[11px] font-bold rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500"
        >
          {MODULE_OPTIONS.map(mod => (
            <option key={mod.id} value={mod.id}>
              {mod.label}
            </option>
          ))}
        </select>
      </div>

      {/* Live Logs & Alerts News Section / Ticker */}
      <div className="bg-slate-900 border-b border-indigo-950 text-white">
        <div className="flex items-center justify-between px-3 py-2 text-[11px]">
          <div className="flex items-center gap-2 overflow-hidden flex-1 cursor-pointer" onClick={() => currentTickerItem && handleNewsItemClick(currentTickerItem)}>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-black uppercase tracking-wider flex-shrink-0">
              <Radio className="h-3 w-3 animate-pulse text-rose-400" />
              LIVE TELEMETRY
            </div>

            {currentTickerItem ? (
              <div className="flex items-center gap-2 truncate text-slate-200 hover:text-indigo-300 transition">
                <span className={`font-bold text-[10px] ${currentTickerItem.type === 'alert' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {currentTickerItem.title}
                </span>
                <span className="text-slate-400 text-[10px] truncate">— {currentTickerItem.detail}</span>
              </div>
            ) : (
              <span className="text-slate-400 text-[10px]">Listening for live incoming log telemetry & security alerts...</span>
            )}
          </div>

          <button 
            onClick={() => setShowNewsFeed(prev => !prev)}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 text-slate-400 text-[10px] font-bold transition flex-shrink-0"
            title="Toggle Live Telemetry Feed"
          >
            <Newspaper className="h-3.5 w-3.5 text-indigo-400" />
            <span>{liveNews.length} events</span>
            {showNewsFeed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {/* Expandable Live Feed Panel */}
        {showNewsFeed && (
          <div className="max-h-48 overflow-y-auto p-2 bg-slate-950 border-t border-slate-800 space-y-1.5 scrollbar-thin">
            <div className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-wider flex items-center justify-between">
              <span>Incoming Telemetry News Feed (Click item to analyze with AI)</span>
              <span className="text-emerald-400 font-mono text-[9px]">● AUTO-REFRESHING</span>
            </div>
            {liveNews.length === 0 ? (
              <div className="p-2 text-slate-500 text-[11px]">No active telemetry logs or alerts detected.</div>
            ) : (
              liveNews.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleNewsItemClick(item)}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:bg-indigo-950/40 transition cursor-pointer flex items-start justify-between gap-2 group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                        item.type === 'alert' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-[11px] font-bold text-slate-200 group-hover:text-indigo-300 transition">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {item.detail}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-400 group-hover:underline flex-shrink-0 pt-0.5">
                    Ask AI →
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Action Notification Toast Banner */}
      {actionStatus && (
        <div className={`px-4 py-2 text-xs font-bold flex items-center justify-between ${
          actionStatus.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          <span>{actionStatus.msg}</span>
          <button onClick={() => setActionStatus(null)}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Quick Suggestion Prompt Chips */}
      <div className="p-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto flex gap-2 scrollbar-none">
        <button
          onClick={() => handleSendPrompt("Explain Current Security Posture")}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-[11px] font-bold text-slate-700 transition shadow-sm"
        >
          <Zap className="h-3 w-3 text-amber-500" />
          Explain Posture
        </button>

        <button
          onClick={() => handleSendPrompt("Analyze High Severity Alerts")}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-rose-400 hover:bg-rose-50 text-[11px] font-bold text-slate-700 transition shadow-sm"
        >
          <ShieldAlert className="h-3 w-3 text-rose-500" />
          Analyze Critical Alerts
        </button>

        <button
          onClick={() => handleSendPrompt("Generate Incident Remediation Guide")}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-[11px] font-bold text-slate-700 transition shadow-sm"
        >
          <Terminal className="h-3 w-3 text-emerald-600" />
          Remediation Playbook
        </button>

        <button
          onClick={() => handleSendPrompt("Show failed logins from suspicious IPs")}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-purple-400 hover:bg-purple-50 text-[11px] font-bold text-slate-700 transition shadow-sm"
        >
          <Activity className="h-3 w-3 text-purple-600" />
          Suspicious Logins
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
              {msg.sender === 'assistant' ? (
                <>
                  <Bot className="h-3 w-3 text-indigo-600" />
                  <span className="font-bold text-slate-600">AI Copilot</span>
                </>
              ) : (
                <span className="font-bold text-slate-600">Operator</span>
              )}
              <span>• {msg.timestamp}</span>
            </div>

            <div
              className={`relative max-w-[92%] p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none font-medium'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
              }`}
            >
              {msg.sender === 'assistant' && (
                <button
                  onClick={() => handleCopyText(msg.text, msg.id)}
                  className="absolute top-2.5 right-2.5 p-1 rounded text-slate-400 hover:text-slate-600 transition"
                  title="Copy response text"
                >
                  {copiedIdx === msg.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              )}
              
              {renderFormattedMarkdown(msg.text)}

              {/* Interactive One-Click Action Recommendations */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-full">
                    Recommended SOC Playbook Actions:
                  </span>
                  {msg.actions.map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExecuteAction(act)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-600 hover:text-white text-indigo-700 text-[11px] font-bold transition shadow-xs"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      {act.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 w-fit shadow-xs">
            <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
            <span>AI Copilot is analyzing live SOC database telemetry...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Prompt Box */}
      <div className="p-3.5 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
              isListening
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            title={isListening ? "Listening... Speak now" : "Voice dictation"}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask AI in plain English (e.g. Show failed logins from Russia)..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:outline-none transition"
          />

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition shadow-md"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
