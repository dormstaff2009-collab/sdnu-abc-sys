import React, { useState } from 'react';
import { AuthErrorInfo } from '../context/AuthContext';
import { 
  AlertTriangle, 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldAlert, 
  Info,
  Globe
} from 'lucide-react';

interface AuthErrorModalProps {
  error: AuthErrorInfo | null;
  onClose: () => void;
  onRetry: () => void;
}

export const AuthErrorModal: React.FC<AuthErrorModalProps> = ({
  error,
  onClose,
  onRetry,
}) => {
  const [copied, setCopied] = useState(false);

  if (!error) return null;

  const isUnauthorizedDomain = error.code === 'auth/unauthorized-domain';
  const isPopupBlocked = error.code === 'auth/popup-blocked';
  const isPopupClosedByUser = error.code === 'auth/popup-closed-by-user';

  const handleCopyDomain = () => {
    if (error.currentDomain) {
      navigator.clipboard.writeText(error.currentDomain);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-amber-50/70 border-b border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isUnauthorizedDomain
                  ? 'ต้องเพิ่มโดเมนใน Firebase Console'
                  : isPopupBlocked
                  ? 'เบราว์เซอร์บล็อกหน้าต่าง Pop-up'
                  : isPopupClosedByUser
                  ? 'ยกเลิกการเข้าสู่ระบบ'
                  : 'ไม่สามารถเข้าสู่ระบบ Google ได้'}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                รหัสข้อผิดพลาด: {error.code}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {isUnauthorizedDomain ? (
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>
                Firebase ของโปรเจกต์ <strong className="text-slate-900 font-mono">sdnu-abc-sys</strong> ยังไม่ได้อนุญาตชื่อโดเมนนี้สำหรับการเข้าสู่ระบบด้วย Google:
              </p>

              {/* Domain Box */}
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-mono text-xs font-bold text-slate-800 truncate">
                    {error.currentDomain || window.location.hostname}
                  </span>
                </div>
                <button
                  onClick={handleCopyDomain}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg border border-slate-300 shadow-2xs shrink-0 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอกโดเมน</span>
                    </>
                  )}
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-100 space-y-2 text-xs">
                <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  วิธีแก้ไขง่ายๆ ใน Firebase Console (ทำเพียง 1 ครั้ง):
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-700 pl-1">
                  <li>
                    เปิดไปที่ <a href="https://console.firebase.google.com/project/sdnu-abc-sys/authentication/settings" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline inline-flex items-center gap-0.5">Firebase Console (sdnu-abc-sys) <ExternalLink className="w-3 h-3" /></a>
                  </li>
                  <li>ไปที่เมนู <strong>Authentication</strong> &rarr; แท็บ <strong>Settings</strong></li>
                  <li>เลื่อนลงไปที่หัวข้อ <strong>Authorized domains</strong></li>
                  <li>กดปุ่ม <strong>Add domain</strong> แล้ววางชื่อโดเมนที่คัดลอกไว้</li>
                  <li>กด <strong>Save</strong> แล้วกลับมากดปุ่มลองใหม่อีกครั้งด้านล่าง</li>
                </ol>
              </div>
            </div>
          ) : isPopupBlocked ? (
            <div className="space-y-3 text-xs sm:text-sm text-slate-600">
              <p>
                เบราว์เซอร์ของคุณมีการบล็อกหน้าต่าง Pop-up ทำให้หน้าต่างเข้าสู่ระบบของ Google ไม่สามารถเปิดขึ้นมาได้
              </p>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <strong>วิธีแก้ไข:</strong>
                <p>
                  โปรดดูที่แถบที่อยู่เว็บ (Address Bar) ด้านบนขวา จะมีไอคอนป็อปอัปที่ถูกบล็อก ให้คลิกแล้วเลือก <strong>&quot;อนุญาตป็อปอัปสำหรับเว็บไซต์นี้เสมอ (Always allow pop-ups)&quot;</strong> แล้วกดปุ่มลองใหม่อีกครั้ง
                </p>
              </div>
            </div>
          ) : isPopupClosedByUser ? (
            <div className="text-xs sm:text-sm text-slate-600 space-y-2">
              <p>
                หน้าต่างเข้าสู่ระบบ Google ถูกปิดก่อนทำรายการสำเร็จ หากต้องการใช้งานกรุณากดปุ่ม <strong>&quot;ลองใหม่อีกครั้ง&quot;</strong>
              </p>
            </div>
          ) : (
            <div className="text-xs sm:text-sm text-slate-600 space-y-2">
              <p>{error.message}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ปิด
            </button>
            <button
              onClick={() => {
                onClose();
                onRetry();
              }}
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
