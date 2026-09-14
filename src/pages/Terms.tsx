import { useNavigate } from "react-router-dom";
import { TopBar, Screen } from "../components/ui/AppShell";
import { NotebookIcon } from "../components/icons/UIIcons";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <>
      <TopBar title="નિયમો અને શરતો (Terms & Conditions)" onBack={() => navigate(-1)} />
      <Screen withNav={false}>
        <div className="p-4 pb-12 max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-border)]">
            <div className="w-10 h-10 rounded-full bg-[var(--color-saffron-100)] text-[var(--color-saffron-600)] flex items-center justify-center shrink-0">
              <NotebookIcon size={22} />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-[var(--color-ink)] leading-tight">નિયમો અને શરતો</h1>
              <p className="text-[13px] text-[var(--color-ink-faint)]">છેલ્લે અપડેટ: સપ્ટેમ્બર ૨૦૨૬</p>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-[15px] font-bold text-[var(--color-saffron-600)]">૧. સેવાનો ઉદ્દેશ્ય</h2>
            <p className="text-[14px] text-[var(--color-ink-soft)] leading-relaxed">
              "ખેડૂત ખર્ચ" એપ ખેડૂતોને તેમના ખેતીના ખર્ચ, આવક અને ભાગીદારોના હિસાબ રાખવામાં મદદ કરવા માટે બનાવવામાં આવી છે. 
              આ કોઈ સત્તાવાર એકાઉન્ટિંગ (Accounting) અથવા ટેક્સ (Tax) સોફ્ટવેર નથી. ડેટા એન્ટ્રીમાં થતી ભૂલો માટે ડેવલપર કે એપ મેનેજમેન્ટ જવાબદાર રહેશે નહીં.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[15px] font-bold text-[var(--color-saffron-600)]">૨. મેમ્બરશીપ અને પેમેન્ટ</h2>
            <ul className="list-disc pl-5 text-[14px] text-[var(--color-ink-soft)] leading-relaxed space-y-1">
              <li>એપનો ફ્રી ટ્રાયલ ૭ દિવસ માટે છે, ત્યારબાદ એપનો સંપૂર્ણ ઉપયોગ કરવા માટે વાર્ષિક ₹૩૦૦ (₹300/year) મેમ્બરશીપ ફી ભરવાની રહેશે.</li>
              <li>પેમેન્ટ કર્યા પછી, ટ્રાન્ઝેક્શનનો સ્ક્રીનશોટ એપમાં સબમિટ કરવાનો રહેશે. Admin દ્વારા ચકાસણી કર્યા પછી ૨૪ કલાકમાં તમારું એકાઉન્ટ એક્ટિવ થઈ જશે.</li>
              <li>આ સબસ્ક્રિપ્શન આપોઆપ રિન્યૂ (Auto-renewal) થતું નથી. વર્ષ પૂરું થયા પછી તમારે જાતે રિન્યૂ કરવાનું રહેશે.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-[15px] font-bold text-[var(--color-saffron-600)]">૩. રિફંડ પોલિસી (Refund Policy)</h2>
            <p className="text-[14px] text-[var(--color-ink-soft)] leading-relaxed">
              એકવાર પેમેન્ટ કર્યા પછી અને તમારું પ્રીમિયમ એકાઉન્ટ એક્ટિવ થયા પછી, મેમ્બરશીપ ફી <strong>રિફંડ</strong> કરવામાં આવશે નહીં. 
              તમને કોઈ ટેકનિકલ સમસ્યા જણાય તો તમે સપોર્ટ માટે અમારો સંપર્ક કરી શકો છો.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[15px] font-bold text-[var(--color-saffron-600)]">૪. એકાઉન્ટ સસ્પેન્શન (Termination)</h2>
            <p className="text-[14px] text-[var(--color-ink-soft)] leading-relaxed">
              જો કોઈ યુઝર ખોટા પેમેન્ટ સ્ક્રીનશોટ અપલોડ કરે, એપનો દુરુપયોગ કરે અથવા કોઈપણ પ્રકારની છેતરપિંડી કરે, તો Admin તે યુઝરનું એકાઉન્ટ 
              કાયમ માટે સસ્પેન્ડ (Block/Delete) કરવાનો અધિકાર ધરાવે છે. સસ્પેન્ડ થયેલ એકાઉન્ટનું પેમેન્ટ પાછું આપવામાં આવશે નહીં.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[15px] font-bold text-[var(--color-saffron-600)]">૫. નાણાકીય અસ્વીકરણ (Financial Disclaimer)</h2>
            <p className="text-[14px] text-[var(--color-ink-soft)] leading-relaxed">
              એપમાં દર્શાવાતા નફો/ખોટ અને ખર્ચના રિપોર્ટ્સ યુઝર દ્વારા નાખેલા ડેટા પર આધારિત છે. આ આંકડા માત્ર યુઝરના પોતના અંગત વપરાશ માટે છે. 
              તેનો ઉપયોગ બેંક લોન, સત્તાવાર ટેક્સ ઓડિટ કે કાનૂની પુરાવા તરીકે કરી શકાશે નહીં. યુઝર દ્વારા થતી ખોટી ડેટા એન્ટ્રી માટે ડેવલપર્સ જવાબદાર રહેશે નહીં.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[15px] font-bold text-[var(--color-saffron-600)]">૬. પેમેન્ટ ચકાસણી સમય (Payment Verification Window)</h2>
            <p className="text-[14px] text-[var(--color-ink-soft)] leading-relaxed">
              મોબાઈલ UPI દ્વારા ચૂકવેલ મેમ્બરશીપ ફીની ચકાસણી એડમિન દ્વારા મેન્યુઅલી (Manually) કરવામાં આવે છે. ચકાસણી પ્રક્રિયા પૂર્ણ થવામાં 
              સામાન્ય રીતે <strong>૨૪ થી ૪૮ કલાક</strong> નો સમય લાગી શકે છે. ખોટો કે એડિટ કરેલ સ્ક્રીનશોટ મોકલનારનું એકાઉન્ટ તરત બ્લોક કરવામાં આવશે.
            </p>
          </section>
        </div>
      </Screen>
    </>
  );
}
