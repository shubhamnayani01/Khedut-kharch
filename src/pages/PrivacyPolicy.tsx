import { useNavigate } from "react-router-dom";
import { TopBar, Screen } from "../components/ui/AppShell";
import { ShieldIcon } from "../components/icons/UIIcons";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <>
      <TopBar title="ગોપનીયતા નીતિ (Privacy Policy)" onBack={() => navigate(-1)} />
      <Screen withNav={false}>
        <div className="p-4 pb-12 max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-border)]">
            <div className="w-10 h-10 rounded-full bg-[var(--color-crop-100)] text-[var(--color-crop-600)] flex items-center justify-center shrink-0">
              <ShieldIcon size={22} />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-[var(--color-ink)] leading-tight">ગોપનીયતા નીતિ</h1>
              <p className="text-[13px] text-[var(--color-ink-faint)]">છેલ્લે અપડેટ: સપ્ટેમ્બર ૨૦૨૬</p>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-[15px] font-bold text-[var(--color-crop-600)]">૧. અમે કયો ડેટા એકત્રિત કરીએ છીએ?</h2>
            <p className="text-[14px] text-[var(--color-ink-soft)] leading-relaxed">
              ખેડૂત ખર્ચ એપમાં લોગિન કરવા માટે અમે તમારું ઈમેલ આઈડી (Email ID) અને પ્રોફાઇલ નામ મેળવીએ છીએ. 
              આ સિવાય એપમાં તમારા દ્વારા ઉમેરવામાં આવેલ ખેતીનો ખર્ચ, આવક, ભાગીદારનો હિસાબ અને અપલોડ કરેલા ડોક્યુમેન્ટ્સ (ખેડૂત વૉલેટ) નો ડેટા સંગ્રહિત થાય છે.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[15px] font-bold text-[var(--color-crop-600)]">૨. ડેટાનો સંગ્રહ (Data Storage)</h2>
            <p className="text-[14px] text-[var(--color-ink-soft)] leading-relaxed">
              તમારો ડેટા તમારા મોબાઈલમાં (ઓફલાઇન ઉપયોગ માટે) અને અમારા સુરક્ષિત ક્લાઉડ સર્વર પર સંગ્રહિત થાય છે. 
              આનાથી તમારો મોબાઈલ ખોવાય અથવા બદલાય તો પણ તમારો ડેટા સુરક્ષિત રહે છે.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[15px] font-bold text-[var(--color-crop-600)]">૩. ડેટા શેરિંગ (Data Sharing)</h2>
            <p className="text-[14px] text-[var(--color-ink-soft)] leading-relaxed">
              તમારો કોઈપણ અંગત અથવા નાણાકીય ડેટા ત્રીજી પાર્ટી (Third Party) કંપનીઓ કે માર્કેટિંગ એજન્સીઓ સાથે શેર કરવામાં આવતો નથી. 
              તમારો ડેટા માત્ર તમારા ઉપયોગ માટે જ છે અને તે સંપૂર્ણપણે ખાનગી છે.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[15px] font-bold text-[var(--color-crop-600)]">૪. નાણાકીય માહિતી અને પેમેન્ટ</h2>
            <p className="text-[14px] text-[var(--color-ink-soft)] leading-relaxed">
              અમે ક્રેડિટ કાર્ડ, ડેબિટ કાર્ડ કે બેંકના પાસવર્ડ જેવી કોઈ જ નાણાકીય માહિતી માંગતા નથી કે સ્ટોર કરતા નથી. 
              મેમ્બરશીપ માટેનું પેમેન્ટ UPI દ્વારા તમારા પોતાના બેંકિંગ એપથી જ થાય છે અને અમે માત્ર ટ્રાન્ઝેક્શનનો સ્ક્રીનશોટ અને ID (UTR) જ ચકાસણી માટે સ્ટોર કરીએ છીએ.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[15px] font-bold text-[var(--color-crop-600)]">૫. ડોક્યુમેન્ટ સુરક્ષા (Wallet)</h2>
            <p className="text-[14px] text-[var(--color-ink-soft)] leading-relaxed">
              તમે અપલોડ કરેલ ખેતીને લગતા દસ્તાવેજો અથવા 7/12 ના ઉતારા સુરક્ષિત રીતે ક્લાઉડ સ્ટોરેજમાં સેવ થાય છે અને 
              તમારા સિવાય અન્ય કોઈ તેને જોઈ શકતું નથી.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[15px] font-bold text-[var(--color-crop-600)]">૬. કૂકીઝ (Cookies and Local Storage)</h2>
            <p className="text-[14px] text-[var(--color-ink-soft)] leading-relaxed">
              અમે કોઈ જ થર્ડ-પાર્ટી ટ્રેકિંગ કૂકીઝ (Tracking Cookies) નો ઉપયોગ કરતા નથી. 
              એપને યોગ્ય રીતે ચલાવવા અને તમને લોગ-ઇન રાખવા માટે માત્ર અતિ આવશ્યક લોકલ સ્ટોરેજ (Local Storage) નો ઉપયોગ થાય છે.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[15px] font-bold text-[var(--color-crop-600)]">૭. ડેટા અને એકાઉન્ટ ડિલીટ કરવાનો અધિકાર (Data Erasure)</h2>
            <p className="text-[14px] text-[var(--color-ink-soft)] leading-relaxed">
              ભારતીય DPDP Act ૨૦૨૩ અને ગૂગલ નીતિઓ અનુસાર, યુઝરને પોતાનો તમામ ક્લાઉડ ડેટા અને એકાઉન્ટ ડિલીટ કરવાનો સંપૂર્ણ અધિકાર છે. 
              તમે એપના Account / Settings સેક્શનમાં આપેલી વિનંતી દ્વારા અથવા સીધો <strong>shubhamnayani01@gmail.com</strong> પર ઈમેલ કરીને ડેટા ડિલીટ કરાવી શકો છો.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--color-border)] pt-4">
            <h2 className="text-[15px] font-bold text-[var(--color-crop-600)]">૮. ડેટા પ્રોટેક્શન અને ગ્રીવન્સ ઓફિસર (Grievance Support)</h2>
            <p className="text-[14px] text-[var(--color-ink-soft)] leading-relaxed">
              DPDP Act ૨૦૨૩ મુજબ, કોઈપણ પ્રકારની ફરિયાદ, પેમેન્ટ કે ડેટા સંબંધી સમસ્યા માટે તમે અમારા ડેટા ફિડ્યુશિયરીનો સંપર્ક કરી શકો છો:<br /><br />
              <strong>Shubham Nayani (Grievance Officer)</strong><br />
              • સરનામું: Kotda Jadodar, Kachchh, Gujarat, 370605<br />
              • ઈમેલ: shubhamnayani01@gmail.com<br />
              • મોબાઈલ નંબર: (+91) 94272 09737
            </p>
          </section>
        </div>
      </Screen>
    </>
  );
}
