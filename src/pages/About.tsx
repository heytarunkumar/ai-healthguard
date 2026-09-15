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
    <main className="min-h-screen bg-background bg-aurora-mesh bg-grid-texture px-4 py-12 sm:px-6 lg:px-8" id="main-content">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 border border-primary/25 text-primary shadow-glow">
            <img src={logo} alt="AI-HealthGuard" className="h-11 w-11 object-contain" />
          </div>
          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider">
            Bachelor of Technology Project
          </Badge>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            About AI-HealthGuard
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
            AI-Based Ischemic Heart Disease Risk Prediction & Prevention System developed at the Department of Computer Science & Engineering, GL Bajaj Group of Institutions, Mathura (Academic Year 2025–2026).
          </p>
        </div>

        {/* Institutional & Mentor Context */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card-elevated p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-foreground">Academic Institution</h3>
                <p className="text-xs text-muted-foreground">GL Bajaj Group of Institutions, Mathura</p>
              </div>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Affiliation:</strong> Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow, Uttar Pradesh.
              </p>
              <p>
                <strong className="text-foreground">Department:</strong> Department of Computer Science & Engineering.
              </p>
              <p>
                <strong className="text-foreground">Programme:</strong> Bachelor of Technology in Computer Science & Engineering (Major Project).
              </p>
            </div>
          </div>

          <div className="card-elevated p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 shadow-sm">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-foreground">Project Supervision</h3>
                <p className="text-xs text-muted-foreground">Faculty Mentor & Department Leadership</p>
              </div>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Faculty Project Guide:</strong> Ms. Nidhi Agarwal, Assistant Professor, Dept. of CSE.
              </p>
              <p>
                <strong className="text-foreground">Head of Department:</strong> Dr. Rama Kant, Professor & Head, Dept. of CSE.
              </p>
              <p>
                <strong className="text-foreground">Director:</strong> Prof. (Dr.) Neeta Awasthy, Director, GL Bajaj Group of Institutions.
              </p>
            </div>
          </div>
        </div>

        {/* Development Team */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">Project Development Team</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Undergraduate Researchers & Software Engineers</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {team.map((member) => (
              <div
                key={member.roll}
                className="card-elevated p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary font-heading font-extrabold text-lg">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground">{member.name}</h3>
                    <p className="text-xs font-mono font-semibold text-primary">{member.roll}</p>
                    <p className="text-xs font-bold text-muted-foreground mt-0.5">{member.role}</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/60">
                    {member.contributions}
                  </p>
                </div>
              </div>
            ))}
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
