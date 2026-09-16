import { Users, BookOpen, GraduationCap, Heart, Award, ShieldCheck, Building2, CheckCircle2 } from "lucide-react";
import logo from "@/assets/logo.png";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";
import { Badge } from "@/components/ui/badge";

const developer = {
  name: "Tarun Kumar",
  role: "Lead Developer & System Architect",
  badge: "Project Creator",
  contributions: "Architected the end-to-end 6-layer CDSS framework, preprocessing pipeline (median imputation, one-hot encoding, SMOTE class balancing, SF-2 feature selection), XGBoost model training & hyperparameter tuning, localized SHAP explainability visualizations, interactive web dashboard, and real-time inference engine."
};

const supervisor = {
  name: "Dr. Tanya Srivastava",
  title: "Assistant Professor, Dept. of CSE",
  role: "Project Supervisor & Mentor",
  guidance: "Research direction, algorithmic review, clinical decision support validation methodology, and machine learning model evaluation supervision."
};

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
    title: "About Project & Mentorship | AI-HealthGuard",
    description: "Learn about the scientific foundation, machine learning architecture, developer, and research mentorship behind AI-HealthGuard.",
  });

  return (
    <main className="min-h-screen bg-background bg-aurora-mesh bg-grid-texture px-4 py-12 sm:px-6 lg:px-8" id="main-content">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 border border-primary/25 text-primary shadow-glow">
            <img src={logo} alt="AI-HealthGuard" className="h-11 w-11 object-contain" />
          </div>
          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider">
            Clinical Decision Support System
          </Badge>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            About AI-HealthGuard
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
            Explainable AI-Powered Ischemic Heart Disease (IHD) Risk Stratification, SHAP Biomarker Attribution, and Personalized Cardiovascular Prevention Engine.
          </p>
        </div>

        {/* Creator & Supervision Context */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Developer Card */}
          <div className="card-elevated p-6 sm:p-8 space-y-5 flex flex-col justify-between border-primary/25">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow font-heading font-extrabold text-base">
                    TK
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground">{developer.name}</h3>
                    <p className="text-xs font-semibold text-primary">{developer.role}</p>
                  </div>
                </div>
                <Badge variant="default" className="text-[10px] font-bold uppercase">
                  {developer.badge}
                </Badge>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Key Technical Contributions</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {developer.contributions}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border/60 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Full-Stack ML & Explainable AI Engineering</span>
            </div>
          </div>

          {/* Supervisor Card */}
          <div className="card-elevated p-6 sm:p-8 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 shadow-sm">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground">{supervisor.name}</h3>
                    <p className="text-xs font-semibold text-muted-foreground">{supervisor.title}</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase">
                  Supervisor
                </Badge>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mentorship & Academic Guidance</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {supervisor.guidance}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border/60 flex items-center gap-2 text-xs text-muted-foreground">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>Research Supervision & Clinical Validation</span>
            </div>
          </div>
        </div>

        {/* Literature References */}
        <div className="card-elevated p-6 sm:p-8 space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Key Academic References & Benchmark Studies
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Peer-reviewed literature informing the methodology, SMOTE balancing, SF-2 feature selection, and SHAP explainability layer.
            </p>
          </div>

          <ol className="space-y-3 text-xs text-muted-foreground list-decimal pl-4 leading-relaxed">
            {references.map((ref, idx) => (
              <li key={idx} className="pl-1">
                {ref}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </main>
  );
}
