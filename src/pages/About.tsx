import { Users, BookOpen, GraduationCap, Heart, Award, ShieldCheck, Building2, CheckCircle2 } from "lucide-react";
import logo from "@/assets/logo.png";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";
import { Badge } from "@/components/ui/badge";

const team = [
  {
    name: "Tarun Kumar",
    roll: "2205111530052",
    role: "Team Lead & System Architect",
    contributions: "Overall 6-layer architecture, preprocessing pipeline (imputation, encoding, SMOTE, SF-2 feature selection), XGBoost training & hyperparameter tuning, Colab notebook, and project documentation."
  },
  {
    name: "Sakshi Rajput",
    roll: "2205111530046",
    role: "ML Researcher & XAI Lead",
    contributions: "Literature review synthesis, Random Forest & Logistic Regression training and evaluation, SHAP explainability layer (Tree/Kernel explainers), AI Insights dashboard UI, and Prevention Engine design."
  },
  {
    name: "Prashant Prajapati",
    roll: "2205111530036",
    role: "Deep Learning & Evaluation Lead",
    contributions: "Support Vector Machine & Neural Network (Keras/TensorFlow) models, 5-fold and 10-fold cross-validation analysis, PDF export engine, and test suite execution."
  },
];

const references = [
  "V. Chang, V. C. Bhavani, A. Q. Xu, and M. A. Hossain, 'An artificial intelligence model for heart disease detection using machine learning algorithms,' Healthcare Analytics, vol. 2, p. 100016, 2022.",
  "H. El-Sofany, S. A. El-Seoud, H. M. Alwakeel, and M. El-Bendary, 'Predicting Heart Disease Using Machine Learning and Explainable Artificial Intelligence (XAI),' Scientific Reports, vol. 14, 2024.",
  "M. Alshraideh, O. Al-Okaily, B. Al-Smadi, and M. Saudagar, 'A Machine Learning Approach for Heart Attack Prediction,' Applied Computational Intelligence and Soft Computing, vol. 2024, 2024.",
  "D. E. Bani Hani and M. B. Ahmad, 'Machine Learning Algorithms for Ischemic Heart Disease: A Systematic Review,' Current Cardiology Reviews, vol. 19, no. 5, 2023.",
  "T. Vu, Y. Kokubo, M. Watanabe et al., 'Machine Learning Models for Predicting Coronary Heart Disease: JMIR Cardio (Suita Study),' JMIR Cardiology, 2025.",
  "T. Detrano et al., 'International application of a new probability algorithm for the diagnosis of coronary artery disease,' The American Journal of Cardiology, vol. 64, no. 5, pp. 304–310, 1989. [UCI Cleveland Dataset]",
  "S. M. Lundberg and S.-I. Lee, 'A unified approach to interpreting model predictions,' Advances in NeurIPS, vol. 30, 2017. [SHAP Framework]",
  "N. V. Chawla et al., 'SMOTE: Synthetic Minority Over-sampling Technique,' JAIR, vol. 16, pp. 321–357, 2002."
];

export default function About() {
  useSEO({
    title: "About Project & Team | AI-HealthGuard",
    description: "Learn about the scientific foundation, machine learning architecture, team members, and academic research behind AI-HealthGuard at GL Bajaj Group of Institutions.",
  });

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8" id="main-content">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
            <img src={logo} alt="AI-HealthGuard" className="h-12 w-12 object-contain" />
          </div>
          <Badge variant="outline" className="mb-3 border-primary/30 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider">
            Bachelor of Technology Project
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            About AI-HealthGuard
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            AI-Based Ischemic Heart Disease Risk Prediction & Prevention System developed at the Department of Computer Science & Engineering, GL Bajaj Group of Institutions, Mathura (Academic Year 2025–2026).
          </p>
        </div>

        {/* Institutional & Mentor Context */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-base text-foreground">Academic Institution</h2>
                <p className="text-xs text-muted-foreground">Department of Computer Science and Engineering</p>
              </div>
            </div>

            <dl className="space-y-3 text-xs">
              <div>
                <dt className="text-muted-foreground font-medium">Institution</dt>
                <dd className="font-bold text-foreground text-sm">GL Bajaj Group of Institutions, Mathura</dd>
                <dd className="text-[11px] text-muted-foreground">Approved by AICTE & Affiliated to Dr. APJ Abdul Kalam Technical University (AKTU), Lucknow</dd>
              </div>
              <div className="pt-2 border-t border-border/60">
                <dt className="text-muted-foreground font-medium">Project Mentorship & Guidance</dt>
                <dd className="font-bold text-foreground text-sm">Er. Tanya Shrivastava</dd>
                <dd className="text-[11px] text-muted-foreground">Assistant Professor, Department of CSE</dd>
              </div>
              <div className="pt-2 border-t border-border/60">
                <dt className="text-muted-foreground font-medium">Head of Department</dt>
                <dd className="font-bold text-foreground text-sm">Pramod Kumar</dd>
                <dd className="text-[11px] text-muted-foreground">Head of Department, Dept. of CSE - AIML</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-base text-foreground">Public Health Impact</h2>
                <p className="text-xs text-muted-foreground">Democratizing Cardiovascular Risk Screening</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              In India, over 54 million individuals live with coronary artery disease, with disproportionate impact on underserved Tier-2/Tier-3 populations lacking access to specialized cath labs.
            </p>
            <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4 space-y-1.5 text-xs">
              <span className="font-bold text-primary flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> National Health Mission Alignment
              </span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                AI-HealthGuard supports India's National Digital Health initiatives under Ayushman Bharat and Digital India by offering a zero-cost, browser-accessible, and explainable cardiovascular screening framework.
              </p>
            </div>
          </div>
        </div>

        {/* Project Authors (Section 5.9 in Report) */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground">Engineering & Research Team</h2>
            <p className="text-xs text-muted-foreground mt-1">Individual contributions as documented in Section 5.9 of the project report.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {team.map((member) => (
              <div key={member.roll} className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wider">{member.role}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">{member.roll}</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{member.name}</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{member.contributions}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Research Literature References (Chapter 2 in Report) */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-foreground">Research References & Scientific Foundation</h2>
              <p className="text-xs text-muted-foreground">Key peer-reviewed studies informing the AI-HealthGuard pipeline (2022–2025).</p>
            </div>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 text-xs text-muted-foreground">
            {references.map((ref, idx) => (
              <li key={idx} className="p-3 rounded-xl bg-muted/20 border border-border/50 flex gap-2.5 items-start">
                <span className="font-bold text-primary text-[11px] shrink-0">[{idx + 1}]</span>
                <span className="leading-relaxed">{ref}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Clinical Disclaimer */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-center text-xs text-muted-foreground max-w-3xl mx-auto space-y-2">
          <p className="font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider text-[11px]">
            Academic & Clinical Decision Support Disclaimer
          </p>
          <p className="leading-relaxed">
            AI-HealthGuard is an academic research software system designed to assist clinical research and primary risk screening. It is not an automated diagnostic device. All machine predictions and SHAP analyses must be clinically validated by a certified healthcare professional or cardiologist.
          </p>
        </div>
      </div>
    </main>
  );
}
