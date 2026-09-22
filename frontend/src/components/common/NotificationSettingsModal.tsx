import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Send, CheckCircle2, ShieldAlert, X, Smartphone, Globe } from 'lucide-react';
import { NotificationService } from '../../services/api';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [webhookUrl, setWebhookUrl] = useState<string>(() => 
    localStorage.getItem('soc_webhook_url') || 'https://hooks.slack.com/services/T000/B000/XXXX'
  );
  const [channelType, setChannelType] = useState<string>('slack');
  const [browserPushEnabled, setBrowserPushEnabled] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('default');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
      setBrowserPushEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handleRequestPushPermission = async () => {
    if (!('Notification' in window)) {
      onShowToast('Native Web Push Notifications not supported in this browser environment.');
      return;
    }

    try {
      const status = await Notification.requestPermission();
      setPermissionStatus(status);
      if (status === 'granted') {
        setBrowserPushEnabled(true);
        onShowToast('Browser Web Push Notifications Granted! Critical alerts will notify you instantly.');
        new Notification('🚨 SOC Sentinel Notification', {
          body: 'Web Push Notifications successfully registered for Unified SOC Command.',
          icon: 'https://cdn-icons-png.flaticon.com/512/2092/2092663.png'
        });
      } else {
        setBrowserPushEnabled(false);
        onShowToast('Push notification permission denied by user.');
      }
    } catch (err) {
      console.error('Permission error:', err);
    }
  };

  const handleSaveWebhook = () => {
    localStorage.setItem('soc_webhook_url', webhookUrl);
    localStorage.setItem('soc_webhook_channel', channelType);
    onShowToast('Saved Multichannel Webhook Configuration.');
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      onShowToast('Please enter a valid Webhook URL.');
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await NotificationService.testWebhook(webhookUrl, channelType);
      setTestResult(res.data.message || 'Webhook test successful.');
      onShowToast('Test notification payload sent!');
    } catch (err: any) {
      setTestResult(`Webhook test notice: ${err.message || 'Check URL format'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDispatchSampleAlert = async () => {
    setIsTesting(true);
    try {
      await NotificationService.dispatchAlertWebhook({
        webhook_url: webhookUrl,
        alert_id: 4092,
        rule_name: 'CRITICAL: Lateral Movement via LSASS Dump',
        severity: 'Critical',
        source_ip: '10.0.4.15',
        mitre_tactic: 'Credential Access (T1003)',
        evidence: 'LSASS process memory handle acquired by unauthorized mimikatz.exe binary.'
      });
      onShowToast('Dispatched Sample Critical Alert to Slack/Discord Webhook!');
    } catch (err) {
      onShowToast('Failed to dispatch alert payload.');
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-amber-500/40 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 text-white shadow-lg">
              <BellRing className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Multichannel Alerts & Webhooks
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-amber-400 border border-amber-500/30">
                  Instant Dispatch
                </span>
              </h2>
              <p className="text-xs text-slate-400">Browser Push, Slack & Discord Incident Escalation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Web Push Notifications Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="h-5 w-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Browser Web Push Alerts</h3>
                  <p className="text-xs text-slate-400">Receive instant desktop & OS alerts on Critical SOC threats</p>
                </div>
              </div>
              <button
                onClick={handleRequestPushPermission}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition shadow-sm ${
                  browserPushEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                <Bell className="h-3.5 w-3.5" />
                <span>{browserPushEnabled ? 'PUSH: ACTIVE' : 'Enable Web Push'}</span>
              </button>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1 border-t border-slate-800/80">
              <span>Permission Status:</span>
              <span className={`font-mono font-bold uppercase px-1.5 py-0.2 rounded text-[10px] ${
                permissionStatus === 'granted' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                {permissionStatus}
              </span>
            </div>
          </div>

          {/* Webhook Configuration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-amber-400" />
                Incident Escalation Webhook URL
              </label>
              <select
                value={channelType}
                onChange={(e) => setChannelType(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-800 text-xs font-bold text-slate-200 px-2.5 py-1"
              >
                <option value="slack">Slack Webhook</option>
                <option value="discord">Discord Webhook</option>
                <option value="generic">Custom HTTP Endpoint</option>
              </select>
            </div>

            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 font-mono text-xs text-slate-200 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Supported Formats: Slack Incoming Webhooks & Discord Embeds</span>
              <button
                onClick={handleSaveWebhook}
                className="text-amber-400 hover:text-amber-300 font-bold underline"
              >
                Save URL
              </button>
            </div>
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3.5 text-xs text-blue-300 font-mono flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
              <span>{testResult}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/80 px-6 py-4">
          <button
            onClick={handleTestWebhook}
            disabled={isTesting}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-200 transition"
          >
            <Send className="h-3.5 w-3.5 text-amber-400" />
            <span>{isTesting ? 'Testing...' : 'Send Test Channel Ping'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDispatchSampleAlert}
              disabled={isTesting}
              className="flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/20 hover:bg-rose-500/30 px-3.5 py-2 text-xs font-bold text-rose-300 transition"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
              <span>Dispatch Sample Critical Alert</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-white transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
