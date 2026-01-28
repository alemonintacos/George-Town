import { useState, useMemo, useEffect } from 'react'
import { isSupabaseConfigured } from './lib/supabase'
import { useWeatherBackground } from './hooks/useWeatherBackground'

const CLINICAL_PEARLS = [
  "The most common cause of iron deficiency anaemia in adult males and post-menopausal females is GI blood loss until proven otherwise.",
  "A widened mediastinum on chest X-ray after trauma should raise immediate suspicion for aortic injury.",
  "Painless jaundice in an elderly patient is pancreatic cancer until proven otherwise.",
  "Never forget to check glucose in any patient with altered mental status — hypoglycaemia mimics stroke.",
  "The most dangerous time after an MI is the first 48 hours — monitor for arrhythmias.",
  "A normal D-dimer effectively rules out PE in low-risk patients, but an elevated D-dimer is non-specific.",
  "Bilateral hilar lymphadenopathy in a young adult: think sarcoidosis before lymphoma.",
  "In acute pancreatitis, the two most common causes account for ~80% of cases: gallstones and alcohol.",
  "Any new-onset seizure in an adult warrants neuroimaging — the threshold for a CT should be low.",
  "The triad of hypotension, distended neck veins, and muffled heart sounds suggests cardiac tamponade.",
  "Addisonian crisis can present as refractory hypotension — always consider adrenal insufficiency in shock.",
  "A third heart sound (S3) in a patient over 40 is pathological and suggests volume overload or heart failure.",
  "Refeeding syndrome risk is highest in the first 72 hours — monitor phosphate, potassium, and magnesium.",
  "Thyroid storm is a clinical diagnosis — do not wait for lab confirmation before treating.",
  "An elevated anion gap metabolic acidosis has a limited differential: MUDPILES (Methanol, Uraemia, DKA, Propylene glycol, INH/Iron, Lactic acidosis, Ethylene glycol, Salicylates).",
  "Erythema migrans does not require serological confirmation — treat empirically for Lyme disease.",
  "Cullen's sign (periumbilical bruising) and Grey Turner's sign (flank bruising) indicate retroperitoneal haemorrhage.",
  "In suspected meningitis, do not delay antibiotics for lumbar puncture or imaging.",
  "Bitemporal hemianopia localises a lesion to the optic chiasm — most commonly a pituitary adenoma.",
  "A unilateral, fixed, dilated pupil in a deteriorating patient suggests uncal herniation — this is a neurosurgical emergency.",
  "The classic triad of NPH: 'wet, wobbly, and wacky' — urinary incontinence, gait apraxia, and dementia.",
  "Proximal muscle weakness with elevated CK: consider polymyositis or statin-induced myopathy.",
  "The most common cause of a pleural transudate is congestive heart failure.",
  "A new left bundle branch block in the context of chest pain should be treated as a STEMI equivalent.",
  "Reed-Sternberg cells are pathognomonic for Hodgkin's lymphoma.",
  "In compartment syndrome, pain out of proportion to the injury and pain on passive stretch are the earliest signs — do not wait for loss of pulses.",
  "Charcot's triad (fever, jaundice, RUQ pain) suggests ascending cholangitis; Reynolds' pentad adds hypotension and confusion.",
  "The most reliable early sign of increased intracranial pressure is a decreasing level of consciousness.",
  "In suspected ectopic pregnancy, a positive pregnancy test with an empty uterus on ultrasound is ectopic until proven otherwise.",
  "Koplik spots on the buccal mucosa are pathognomonic for measles and appear before the rash.",
  "Hyperkalaemia with ECG changes (peaked T waves, widened QRS) is a medical emergency — give IV calcium gluconate immediately.",
  "The most common cause of community-acquired pneumonia is Streptococcus pneumoniae.",
  "Murphy's sign (inspiratory arrest during RUQ palpation) is suggestive of acute cholecystitis.",
  "A non-blanching petechial rash with fever in a child is meningococcal septicaemia until proven otherwise.",
  "In DKA, the potassium may appear normal or high initially, but total body potassium is always depleted.",
  "Trousseau's sign (carpopedal spasm with BP cuff inflation) and Chvostek's sign (facial twitching on tapping) indicate hypocalcaemia.",
  "An irregularly irregular pulse is atrial fibrillation until proven otherwise.",
  "The 4 T's of post-partum haemorrhage: Tone, Trauma, Tissue, Thrombin.",
  "Kussmaul breathing (deep, laboured breathing) is the respiratory compensation for metabolic acidosis.",
  "A cherry-red spot on fundoscopy suggests central retinal artery occlusion — this is an ophthalmological emergency.",
]

function getDailyPearl(): string {
  const now = new Date()
  const dayIndex = Math.floor(now.getTime() / 86400000) % CLINICAL_PEARLS.length
  return CLINICAL_PEARLS[dayIndex]
}

import { useTasks } from './hooks/useTasks'
import { useTimeTracker } from './hooks/useTimeTracker'
import { Dashboard } from './components/Dashboard'
import { TimeTracker } from './components/TimeTracker'
import { BuildingCard } from './components/buildings/BuildingCard'
import { UniversitySchool } from './components/buildings/UniversitySchool'
import { WorkPlace } from './components/buildings/WorkPlace'
import { TavernPub } from './components/buildings/TavernPub'
import { NoticeBoard } from './components/buildings/NoticeBoard'

function Stars() {
  const stars = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 4}s`,
    size: Math.random() * 2 + 1,
  }))

  return (
    <div className="stars">
      {stars.map(s => (
        <div
          key={s.id}
          className="star animate-sparkle"
          style={{
            left: s.left,
            top: s.top,
            animationDelay: s.delay,
            width: s.size,
            height: s.size,
          }}
        />
      ))}
    </div>
  )
}

type Building = 'university' | 'work' | 'social' | 'notice' | null

function App() {
  const { tasks, loading, addTask, updateStatus, deleteTask } = useTasks()
  const { activeTaskId, elapsed, start, stop } = useTimeTracker()
  const [activeBuilding, setActiveBuilding] = useState<Building>(null)
  const dailyPearl = useMemo(() => getDailyPearl(), [])
  const wb = useWeatherBackground()

  useEffect(() => {
    document.body.style.background = wb.background
  }, [wb.background])

  const goBack = () => setActiveBuilding(null)

  const sharedProps = {
    tasks,
    loading,
    onAdd: addTask,
    onUpdateStatus: updateStatus,
    onDelete: deleteTask,
    activeTaskId,
    elapsed,
    onStartTimer: start,
    onStopTimer: stop,
    onBack: goBack,
  }

  return (
    <div className="min-h-screen relative">
      {wb.showStars && <Stars />}

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        {/* Village Gate Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-2 animate-float">🏰</div>
          <h1 className="font-cinzel text-5xl font-black text-gold-light drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">
            George Town
          </h1>
          <p className="font-lora italic text-parchment/80 text-sm mt-1 tracking-widest">
            ⚔️ A Realm of Productivity & Glory ⚔️
          </p>
          <div className="flex items-start justify-center gap-3 mt-3">
            <span className="text-2xl animate-flicker shrink-0">🏮</span>
            <p className="font-lora italic text-parchment/50 text-xs leading-relaxed max-w-md text-center mt-1">
              "{dailyPearl}"
            </p>
            <span className="text-2xl animate-flicker shrink-0" style={{ animationDelay: '1.5s' }}>🏮</span>
          </div>
        </div>

        {!isSupabaseConfigured && (
          <div className="quest-scroll rounded-xl p-6 text-center mb-8">
            <div className="text-4xl mb-3">📜</div>
            <h2 className="font-cinzel text-lg font-bold text-leather mb-2">
              The Oracle Awaits Connection
            </h2>
            <p className="font-lora text-sm text-tavern">
              Copy <code className="font-mono bg-leather/10 px-1.5 py-0.5 rounded text-leather">.env.example</code> to{' '}
              <code className="font-mono bg-leather/10 px-1.5 py-0.5 rounded text-leather">.env</code>{' '}
              and inscribe your Supabase URL and anon key to awaken the village.
            </p>
          </div>
        )}

        {isSupabaseConfigured && (
          <>
            <Dashboard tasks={tasks} />
            <TimeTracker activeTaskId={activeTaskId} elapsed={elapsed} tasks={tasks} onStop={stop} />

            {activeBuilding === null && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                <BuildingCard
                  icon="🏛️"
                  name="University School"
                  subtitle="Study & classes"
                  gradient="from-purple-950 to-indigo-950"
                  border="border-purple-500/60"
                  onClick={() => setActiveBuilding('university')}
                />
                <BuildingCard
                  icon="⚒️"
                  name="Work Place"
                  subtitle="Shifts & projects"
                  gradient="from-stone-900 to-zinc-900"
                  border="border-stone/60"
                  onClick={() => setActiveBuilding('work')}
                />
                <BuildingCard
                  icon="🍺"
                  name="Tavern Pub"
                  subtitle="Social events"
                  gradient="from-amber-950 to-orange-950"
                  border="border-amber-500/60"
                  onClick={() => setActiveBuilding('social')}
                />
                <BuildingCard
                  icon="📋"
                  name="Notice Board"
                  subtitle="Goals & schedule"
                  gradient="from-stone-dark to-stone-900"
                  border="border-parchment/40"
                  onClick={() => setActiveBuilding('notice')}
                />
              </div>
            )}

            {activeBuilding === 'university' && <UniversitySchool {...sharedProps} />}
            {activeBuilding === 'work' && <WorkPlace {...sharedProps} />}
            {activeBuilding === 'social' && <TavernPub {...sharedProps} />}
            {activeBuilding === 'notice' && <NoticeBoard {...sharedProps} />}

            {/* Village Footer */}
            <div className="text-center mt-8 space-y-1">
              <div className="flex justify-center gap-1 text-lg">
                🌲🌲🏠🏚️🏠🌲🏠🌲🌲
              </div>
              <p className="font-medieval text-parchment/30 text-xs">
                Est. MMXXVI — George Town Village Council
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App
