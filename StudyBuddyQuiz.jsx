import { useState } from "react";

// ─────────────────────────────────────────────
//  DESIGN TOKENS  — black + ombre purple palette
// ─────────────────────────────────────────────
const T = {
  black:      "#0a0a0f",
  darkBg:     "#0f0f1a",
  cardBg:     "#13131f",
  cardBg2:    "#1a1a2e",
  border:     "rgba(139,92,246,0.18)",
  borderHov:  "rgba(139,92,246,0.55)",
  p100: "#ede9fe",
  p300: "#c4b5fd",
  p400: "#a78bfa",
  p500: "#8b5cf6",
  p600: "#7c3aed",
  p700: "#6d28d9",
  p800: "#5b21b6",
  p900: "#4c1d95",
  textPrimary:   "#f0eeff",
  textSecondary: "#a59fc7",
  textMuted:     "#5e5880",
  green:  "#34d399",
  red:    "#f87171",
  greenBg:"rgba(52,211,153,0.10)",
  redBg:  "rgba(248,113,113,0.10)",
  gradOmbre: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 45%, #4c1d95 100%)",
};

// ─────────────────────────────────────────────
//  QUIZ DATA
// ─────────────────────────────────────────────
const QUIZ_DATA = {
  "Algebra / Pre-Calc": {
    "High School": [
      { id:"alg-hs-1", question:"Solve for x: 2x + 5 = 17", options:["x = 4","x = 6","x = 11","x = 3"], answer:1, explanation:"Subtract 5 from both sides: 2x = 12, then divide by 2: x = 6." },
      { id:"alg-hs-2", question:"Which of the following is the slope of the line y = -3x + 7?", options:["7","3","-3","-7"], answer:2, explanation:"In slope-intercept form y = mx + b, m is the slope. Here m = -3." },
      { id:"alg-hs-3", question:"Factor: x² - 9", options:["(x-3)²","(x+3)(x-3)","(x-9)(x+1)","(x+9)(x-1)"], answer:1, explanation:"Difference of squares: a² - b² = (a+b)(a-b), so x² - 9 = (x+3)(x-3)." },
      { id:"alg-hs-4", question:"What is the vertex of f(x) = (x - 2)² + 5?", options:["(-2, 5)","(2, -5)","(2, 5)","(-2, -5)"], answer:2, explanation:"In vertex form f(x) = (x-h)² + k, vertex is (h,k). Here h=2, k=5." },
      { id:"alg-hs-5", question:"Simplify: (3x²y)(4xy³)", options:["12x³y⁴","7x³y⁴","12x²y³","12x³y³"], answer:0, explanation:"Multiply coefficients: 3×4=12. Add exponents: x²⁺¹=x³, y¹⁺³=y⁴." },
    ],
    "AP / Pre-College": [
      { id:"alg-ap-1", question:"Find all real solutions: x⁴ - 5x² + 4 = 0", options:["x = ±1, ±2","x = ±1, ±4","x = 1, 4","x = ±2, ±4"], answer:0, explanation:"Let u = x². Then u²-5u+4=0 → (u-1)(u-4)=0 → u=1 or 4 → x = ±1 or ±2." },
      { id:"alg-ap-2", question:"An infinite geometric series sums to 12, first term is 4. What is the common ratio?", options:["1/4","1/3","2/3","3/4"], answer:2, explanation:"S = a/(1-r) → 12 = 4/(1-r) → 1-r = 1/3 → r = 2/3." },
      { id:"alg-ap-3", question:"If log₂(x) + log₂(x-2) = 3, find x.", options:["x = 4","x = -2","x = 8","x = 2"], answer:0, explanation:"log₂(x(x-2))=3 → x(x-2)=8 → x²-2x-8=0 → (x-4)(x+2)=0. Since x>2, x=4." },
      { id:"alg-ap-4", question:"How many terms are in the expansion of (a + b)⁸?", options:["7","8","9","16"], answer:2, explanation:"Binomial expansion of (a+b)ⁿ has n+1 terms. So (a+b)⁸ has 9 terms." },
    ],
    "College Intro": [
      { id:"alg-ci-1", question:"What is the domain of f(x) = √(4 - x²)?", options:["(-∞, ∞)","[-2, 2]","[0, 2]","(-2, 2)"], answer:1, explanation:"Need 4-x²≥0 → x²≤4 → -2≤x≤2 → domain is [-2, 2]." },
      { id:"alg-ci-2", question:"Which conic section is represented by x²/9 + y²/4 = 1?", options:["Circle","Ellipse","Hyperbola","Parabola"], answer:1, explanation:"x²/a² + y²/b² = 1 with a≠b is an ellipse." },
      { id:"alg-ci-3", question:"Find the partial fraction decomposition of 1/(x(x+1)).", options:["1/x + 1/(x+1)","1/x - 1/(x+1)","-1/x + 1/(x+1)","1/(2x) + 1/(2(x+1))"], answer:1, explanation:"1/(x(x+1)) = A/x + B/(x+1). Solving: A=1, B=-1 → 1/x - 1/(x+1)." },
    ],
    "College Advanced": [
      { id:"alg-ca-1", question:"How many solutions does z⁵ = 1 have in ℂ?", options:["1","2","3","5"], answer:3, explanation:"By the Fundamental Theorem of Algebra, zⁿ=1 has exactly n roots in ℂ." },
      { id:"alg-ca-2", question:"Which of the following is a field?", options:["ℤ (integers)","ℤ/6ℤ","ℤ/7ℤ","ℤ/4ℤ"], answer:2, explanation:"ℤ/pℤ is a field iff p is prime. 7 is prime, so ℤ/7ℤ is a field." },
    ],
  },
  "Calculus": {
    "High School": [
      { id:"calc-hs-1", question:"What is the limit of (x² - 1)/(x - 1) as x → 1?", options:["0","1","2","undefined"], answer:2, explanation:"Factor: (x+1)(x-1)/(x-1) = x+1. As x→1, this approaches 2." },
      { id:"calc-hs-2", question:"Find the derivative of f(x) = x³ - 4x.", options:["3x² - 4","3x² + 4","x² - 4","3x - 4"], answer:0, explanation:"Power rule: d/dx(x³)=3x², d/dx(4x)=4. So f'(x) = 3x²-4." },
      { id:"calc-hs-3", question:"What is ∫2x dx?", options:["2","x² + C","2x² + C","x + C"], answer:1, explanation:"∫2x dx = 2·x²/2 + C = x² + C." },
      { id:"calc-hs-4", question:"At what x-value does f(x) = x² - 6x have a minimum?", options:["x = 0","x = 3","x = 6","x = -3"], answer:1, explanation:"f'(x)=2x-6=0 → x=3. f''(x)=2>0 confirms minimum." },
    ],
    "AP / Pre-College": [
      { id:"calc-ap-1", question:"Using the chain rule, find the derivative of f(x) = sin(x²).", options:["cos(x²)","2x·cos(x²)","2x·sin(x²)","-2x·cos(x²)"], answer:1, explanation:"d/dx[sin(u)]=cos(u)·u'. u=x², u'=2x → f'(x)=2x·cos(x²)." },
      { id:"calc-ap-2", question:"Evaluate ∫₀¹ x·eˣ dx.", options:["e - 1","1","e","e + 1"], answer:1, explanation:"Integration by parts: [xeˣ-eˣ]₀¹ = (e-e)-(0-1) = 1." },
      { id:"calc-ap-3", question:"What does MVT guarantee for f(x) = x² on [1,3]?", options:["f'(c)=0","f'(c)=4","f'(c)=2","f'(c)=8"], answer:1, explanation:"f'(c)=(f(3)-f(1))/(3-1)=(9-1)/2=4." },
      { id:"calc-ap-4", question:"Find the area between y = x² and y = x on [0,1].", options:["1/6","1/3","1/2","1/4"], answer:0, explanation:"∫₀¹(x-x²)dx = [x²/2-x³/3]₀¹ = 1/2-1/3 = 1/6." },
    ],
    "College Intro": [
      { id:"calc-ci-1", question:"What is lim(x→0) sin(x)/x?", options:["0","∞","1","undefined"], answer:2, explanation:"Standard limit via squeeze theorem: lim(x→0) sin(x)/x = 1." },
      { id:"calc-ci-2", question:"Find d/dx [ln(x² + 1)].", options:["1/(x²+1)","2x/(x²+1)","2x·ln(x²+1)","x/(x²+1)"], answer:1, explanation:"Chain rule: d/dx[ln(u)]=u'/u. u=x²+1, u'=2x → 2x/(x²+1)." },
      { id:"calc-ci-3", question:"Which test determines convergence of Σ (1/n²)?", options:["Divergence test","p-series test","Ratio test","Integral test only"], answer:1, explanation:"p-series Σ(1/nᵖ) with p=2>1 converges." },
    ],
    "College Advanced": [
      { id:"calc-ca-1", question:"What is the gradient of f(x,y) = x²y + y³ at (1, 2)?", options:["(4, 13)","(4, 1)","(1, 13)","(2, 13)"], answer:0, explanation:"∂f/∂x=2xy=4, ∂f/∂y=x²+3y²=13. Gradient=(4,13)." },
      { id:"calc-ca-2", question:"The Maclaurin series of eˣ is:", options:["Σ xⁿ/n","Σ xⁿ/n!","Σ (-1)ⁿxⁿ/n!","Σ xⁿ/(2n)!"], answer:1, explanation:"eˣ = 1+x+x²/2!+x³/3!+⋯ = Σ xⁿ/n!" },
    ],
  },
  "Physics": {
    "High School": [
      { id:"phys-hs-1", question:"A car accelerates from 0 to 20 m/s in 4 s. What is its acceleration?", options:["4 m/s²","5 m/s²","80 m/s²","2.5 m/s²"], answer:1, explanation:"a = Δv/Δt = 20/4 = 5 m/s²." },
      { id:"phys-hs-2", question:"What force accelerates a 10 kg object at 3 m/s²?", options:["0.3 N","3.3 N","30 N","300 N"], answer:2, explanation:"F = ma = 10×3 = 30 N." },
      { id:"phys-hs-3", question:"Object dropped from rest after 2 s. Velocity? (g=10 m/s²)", options:["5 m/s","10 m/s","20 m/s","40 m/s"], answer:2, explanation:"v = v₀+gt = 0+10(2) = 20 m/s." },
      { id:"phys-hs-4", question:"What energy does a compressed spring store?", options:["Kinetic","Thermal","Elastic potential","Chemical"], answer:2, explanation:"A compressed spring stores elastic PE: PE=½kx²." },
      { id:"phys-hs-5", question:"Which law: every action has an equal and opposite reaction?", options:["Newton's 1st","Newton's 2nd","Newton's 3rd","Conservation of Energy"], answer:2, explanation:"Newton's Third Law states equal and opposite reactions." },
    ],
    "AP / Pre-College": [
      { id:"phys-ap-1", question:"Projectile at 30° above horizontal at 20 m/s. Horizontal velocity?", options:["10 m/s","10√3 m/s","20 m/s","20√3 m/s"], answer:1, explanation:"vₓ=v·cos(30°)=20×(√3/2)=10√3≈17.3 m/s." },
      { id:"phys-ap-2", question:"2 kg block on frictionless surface, 10 N force, 5 m. Work done?", options:["4 J","25 J","50 J","100 J"], answer:2, explanation:"W=F×d=10×5=50 J." },
      { id:"phys-ap-3", question:"Period of a simple pendulum of length 1 m? (g=10 m/s²)", options:["π/√10 s","2π/√10 s","2π s","π s"], answer:1, explanation:"T=2π√(L/g)=2π/√10≈1.99 s." },
    ],
    "College Intro": [
      { id:"phys-ci-1", question:"+2μC and +3μC charges 0.1 m apart. Electrostatic force? (k=9×10⁹)", options:["0.054 N","5.4 N","54 N","540 N"], answer:1, explanation:"F=kq₁q₂/r²=(9×10⁹)(2×10⁻⁶)(3×10⁻⁶)/(0.01)=5.4 N." },
      { id:"phys-ci-2", question:"Speed of light in medium with n=1.5?", options:["2×10⁸ m/s","3×10⁸ m/s","4.5×10⁸ m/s","1.5×10⁸ m/s"], answer:0, explanation:"v=c/n=(3×10⁸)/1.5=2×10⁸ m/s." },
      { id:"phys-ci-3", question:"Which equation is Faraday's law of induction?", options:["F=qE","ε=-dΦ/dt","B=μ₀I/2πr","V=IR"], answer:1, explanation:"Faraday's law: ε=-dΦ/dt (negative rate of change of magnetic flux)." },
    ],
    "College Advanced": [
      { id:"phys-ca-1", question:"What does the Heisenberg Uncertainty Principle state?", options:["Energy and time can't both be precise","Position and momentum can't both be precisely measured","Electrons have wave-particle duality","Wavefunctions collapse on observation"], answer:1, explanation:"ΔxΔp≥ℏ/2: precise position → imprecise momentum." },
      { id:"phys-ca-2", question:"What does the Schrödinger equation describe?", options:["Trajectory of a classical particle","Time evolution of a quantum wavefunction","Bohr model energy levels only","Electron orbital speed"], answer:1, explanation:"iℏ∂ψ/∂t=Ĥψ — how the quantum state ψ evolves in time." },
    ],
  },
  "Chemistry": {
    "High School": [
      { id:"chem-hs-1", question:"How many protons does Carbon have?", options:["4","6","8","12"], answer:1, explanation:"Atomic number 6 = 6 protons." },
      { id:"chem-hs-2", question:"Chemical formula for water?", options:["HO","H₂O","H₂O₂","OH"], answer:1, explanation:"2 hydrogen atoms + 1 oxygen atom = H₂O." },
      { id:"chem-hs-3", question:"2H₂ + O₂ → 2H₂O — what type of reaction?", options:["Decomposition","Single replacement","Synthesis","Double replacement"], answer:2, explanation:"Two substances combine into one — synthesis reaction." },
      { id:"chem-hs-4", question:"Which element has the highest electronegativity?", options:["Oxygen","Chlorine","Nitrogen","Fluorine"], answer:3, explanation:"Fluorine: 3.98 on the Pauling scale — highest of all elements." },
      { id:"chem-hs-5", question:"What is Avogadro's number?", options:["6.02×10²³","3.14×10²³","1.38×10²³","9.11×10²³"], answer:0, explanation:"6.02×10²³ units per mole of any substance." },
    ],
    "AP / Pre-College": [
      { id:"chem-ap-1", question:"pH of a 0.01 M HCl solution?", options:["1","2","3","12"], answer:1, explanation:"HCl fully dissociates → [H⁺]=0.01 M. pH=-log(0.01)=2." },
      { id:"chem-ap-2", question:"For A → B, rate doubles when [A] doubles. Order with respect to A?", options:["Zero","First","Second","Half"], answer:1, explanation:"Rate∝[A]¹ → doubling [A] doubles rate → first order." },
      { id:"chem-ap-3", question:"Quantum numbers for the 2p orbital?", options:["n=2, l=0","n=2, l=1","n=1, l=2","n=2, l=2"], answer:1, explanation:"n=2 (second shell), l=1 (p subshell)." },
    ],
    "College Intro": [
      { id:"chem-ci-1", question:"Which intermolecular force gives water its high boiling point?", options:["London dispersion","Dipole-dipole","Hydrogen bonding","Ionic bonds"], answer:2, explanation:"Strong O-H···O hydrogen bonds require significant energy to break." },
      { id:"chem-ci-2", question:"ΔH when ΔG=-50 kJ, T=298K, ΔS=+0.1 kJ/K?", options:["-79.8 kJ","-20.2 kJ","-50 kJ","-80 kJ"], answer:1, explanation:"ΔH=ΔG+TΔS=-50+(298)(0.1)=-20.2 kJ." },
      { id:"chem-ci-3", question:"In MO theory, out-of-phase orbital combination forms:", options:["A bonding MO","An antibonding MO (σ*)","A non-bonding orbital","No orbital"], answer:1, explanation:"Out-of-phase → antibonding MO (σ* or π*) with nodal plane between nuclei." },
    ],
    "College Advanced": [
      { id:"chem-ca-1", question:"What does the Born-Oppenheimer approximation assume?", options:["Electrons and nuclei move at same speed","Nuclear/electronic motions separate because nuclei are much heavier","All molecules are linear","QM negligible for large molecules"], answer:1, explanation:"Nuclei ~1836× heavier → electrons adjust instantaneously → wavefunctions separate." },
      { id:"chem-ca-2", question:"Which principle governs filling of degenerate orbitals?", options:["Aufbau principle","Pauli exclusion","Hund's rule","Heisenberg"], answer:2, explanation:"Hund's rule: electrons fill degenerate orbitals singly with parallel spins before pairing." },
    ],
  },
  "Biology": {
    "High School": [
      { id:"bio-hs-1", question:"What is the powerhouse of the cell?", options:["Nucleus","Ribosome","Mitochondria","Golgi apparatus"], answer:2, explanation:"Mitochondria produce ATP via cellular respiration." },
      { id:"bio-hs-2", question:"What molecule carries genetic information in most organisms?", options:["Protein","RNA","ATP","DNA"], answer:3, explanation:"DNA stores and transmits genetic information via its base sequence." },
      { id:"bio-hs-3", question:"Which seed color is dominant in Mendel's experiments: yellow (Y) or green (y)?", options:["Green","Yellow","Both","Neither"], answer:1, explanation:"Yellow (Y) is dominant. Only yy genotypes produce green seeds." },
      { id:"bio-hs-4", question:"What process converts sunlight into chemical energy in plants?", options:["Cellular respiration","Fermentation","Photosynthesis","Transpiration"], answer:2, explanation:"Photosynthesis: 6CO₂+6H₂O+light → C₆H₁₂O₆+6O₂." },
      { id:"bio-hs-5", question:"Which blood cells fight infections?", options:["Red blood cells","Platelets","White blood cells","Plasma cells"], answer:2, explanation:"Leukocytes (white blood cells) are the immune system's primary defenders." },
    ],
    "AP / Pre-College": [
      { id:"bio-ap-1", question:"During which phase do homologous chromosomes separate?", options:["Meiosis I — Anaphase I","Meiosis II — Anaphase II","Mitosis — Anaphase","Prophase I"], answer:0, explanation:"Anaphase I: homologs pulled to opposite poles, reducing ploidy 2n→n." },
      { id:"bio-ap-2", question:"What is the primary structure of a protein?", options:["3D folded shape","Sequence of amino acids","Alpha helices and beta sheets","Polypeptide interactions"], answer:1, explanation:"Primary structure = linear sequence of amino acids linked by peptide bonds." },
      { id:"bio-ap-3", question:"Final electron acceptor in the electron transport chain?", options:["NAD⁺","FAD","O₂","ATP"], answer:2, explanation:"O₂ is the final electron acceptor in aerobic respiration, forming H₂O." },
    ],
    "College Intro": [
      { id:"bio-ci-1", question:"Role of mRNA in protein synthesis?", options:["Carries amino acids to ribosome","Catalyzes peptide bond formation","Carries genetic code from DNA to ribosome","Forms ribosome structural core"], answer:2, explanation:"mRNA is transcribed from DNA and directs amino acid order during translation." },
      { id:"bio-ci-2", question:"What does Hardy-Weinberg equilibrium describe?", options:["Rate of natural selection","Allele/genotype frequencies in a non-evolving population","Mutation-drift relationship","How speciation occurs"], answer:1, explanation:"H-W: allele/genotype frequencies in a large, randomly-mating population with no evolutionary forces." },
      { id:"bio-ci-3", question:"Which type of RNA has catalytic activity?", options:["mRNA","tRNA","rRNA","Ribozyme"], answer:3, explanation:"Ribozymes are catalytic RNA molecules (1989 Nobel Prize — Altman & Cech)." },
    ],
    "College Advanced": [
      { id:"bio-ca-1", question:"Role of p53 in the cell cycle?", options:["Promotes cell division","Activates S-phase","Tumor suppressor — halts cycle or triggers apoptosis on DNA damage","Methylates histones"], answer:2, explanation:"p53 upregulates p21 (arrest) and pro-apoptotic genes. Lost in ~50% of human cancers." },
      { id:"bio-ca-2", question:"In CRISPR-Cas9, role of guide RNA (gRNA)?", options:["Cuts the DNA","Repairs the DSB","Directs Cas9 to target via complementary base pairing","Transcribes target gene"], answer:2, explanation:"gRNA's ~20-nt sequence base-pairs with target DNA, positioning Cas9 for precise cutting." },
    ],
  },
};

const SUBJECTS = Object.keys(QUIZ_DATA);
const LEVELS   = ["High School", "AP / Pre-College", "College Intro", "College Advanced"];

const SUBJECT_META = {
  "Algebra / Pre-Calc": { icon: "∑" },
  "Calculus":           { icon: "∫" },
  "Physics":            { icon: "⚛" },
  "Chemistry":          { icon: "⚗" },
  "Biology":            { icon: "⚕" },
};

const LEVEL_META = {
  "High School":      { color: "#c4b5fd", bg: "rgba(196,181,253,0.10)", border: "rgba(196,181,253,0.22)" },
  "AP / Pre-College": { color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.28)" },
  "College Intro":    { color: "#8b5cf6", bg: "rgba(139,92,246,0.14)",  border: "rgba(139,92,246,0.32)"  },
  "College Advanced": { color: "#7c3aed", bg: "rgba(124,58,237,0.18)",  border: "rgba(124,58,237,0.38)"  },
};

// ─────────────────────────────────────────────
//  GLOBAL CSS
// ─────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.4); border-radius: 99px; }

.sb-root {
  min-height: 100vh;
  background: #0a0a0f;
  font-family: 'DM Sans', sans-serif;
  color: #f0eeff;
  position: relative;
  overflow-x: hidden;
}

/* Global ambient glow */
.sb-root::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 90% 55% at 50% -5%, rgba(109,40,217,0.2) 0%, transparent 60%),
    radial-gradient(ellipse 50% 35% at 85% 95%, rgba(76,29,149,0.14) 0%, transparent 55%),
    radial-gradient(ellipse 35% 25% at 5% 80%, rgba(124,58,237,0.08) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.sb-inner { position: relative; z-index: 1; }

/* ── NAV ── */
.sb-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 36px;
  height: 62px;
  border-bottom: 1px solid rgba(139,92,246,0.15);
  backdrop-filter: blur(16px);
  background: rgba(10,10,15,0.8);
  position: sticky;
  top: 0;
  z-index: 100;
}
.sb-logo {
  font-family: 'Syne', sans-serif;
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 45%, #4c1d95 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.sb-nav-tag {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: #5e5880;
  margin-left: 8px;
  font-family: 'DM Sans', sans-serif;
  -webkit-text-fill-color: #5e5880;
}
.sb-nav-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: #5e5880;
  letter-spacing: 0.3px;
}
.sb-nav-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #7c3aed;
  display: inline-block;
}

/* ── HERO ── */
.sb-hero {
  text-align: center;
  padding: 72px 24px 48px;
  max-width: 700px;
  margin: 0 auto;
}
.sb-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 2.8px;
  text-transform: uppercase;
  color: #a78bfa;
  border: 1px solid rgba(167,139,250,0.28);
  border-radius: 99px;
  padding: 6px 16px;
  margin-bottom: 24px;
  background: rgba(167,139,250,0.06);
}
.sb-eyebrow-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: #a78bfa;
  animation: sbBlink 2s ease-in-out infinite;
}
@keyframes sbBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }

.sb-hero-title {
  font-family: 'Syne', sans-serif;
  font-size: clamp(36px, 6vw, 58px);
  font-weight: 800;
  letter-spacing: -2px;
  color: #f0eeff;
  line-height: 1.05;
  margin-bottom: 18px;
}
.sb-hero-title em {
  font-style: normal;
  background: linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 50%, #5b21b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.sb-hero-sub {
  font-size: 16.5px;
  color: #a59fc7;
  font-weight: 300;
  line-height: 1.65;
  max-width: 430px;
  margin: 0 auto 36px;
}

/* Stats */
.sb-stats {
  display: inline-flex;
  align-items: center;
  gap: 0;
  background: rgba(139,92,246,0.07);
  border: 1px solid rgba(139,92,246,0.18);
  border-radius: 16px;
  padding: 0 4px;
  overflow: hidden;
}
.sb-stat {
  padding: 16px 24px;
  text-align: center;
}
.sb-stat + .sb-stat {
  border-left: 1px solid rgba(139,92,246,0.15);
}
.sb-stat-n {
  font-family: 'Syne', sans-serif;
  font-size: 26px;
  font-weight: 800;
  background: linear-gradient(135deg, #a78bfa, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 3px;
}
.sb-stat-l {
  font-size: 10px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #5e5880;
  font-weight: 600;
}

/* ── SUBJECT GRID ── */
.sb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(295px, 1fr));
  gap: 18px;
  max-width: 1080px;
  margin: 52px auto 0;
  padding: 0 28px 72px;
}
.sb-card {
  background: #13131f;
  border: 1px solid rgba(139,92,246,0.16);
  border-radius: 20px;
  padding: 26px 22px 22px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.28s, transform 0.28s, box-shadow 0.28s;
}
.sb-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: radial-gradient(circle at 80% 20%, rgba(124,58,237,0.07) 0%, transparent 55%);
  pointer-events: none;
}
.sb-card:hover {
  border-color: rgba(139,92,246,0.45);
  transform: translateY(-5px);
  box-shadow: 0 24px 64px rgba(76,29,149,0.22), 0 0 0 1px rgba(139,92,246,0.22);
}
.sb-card-icon {
  font-size: 28px;
  display: block;
  margin-bottom: 10px;
  filter: drop-shadow(0 0 10px rgba(139,92,246,0.4));
}
.sb-card-title {
  font-family: 'Syne', sans-serif;
  font-size: 16.5px;
  font-weight: 700;
  color: #f0eeff;
  margin-bottom: 6px;
  letter-spacing: -0.3px;
}
.sb-card-count {
  font-size: 11.5px;
  color: #5e5880;
  margin-bottom: 16px;
  letter-spacing: 0.2px;
}
.sb-card-hr {
  height: 1px;
  background: rgba(139,92,246,0.12);
  margin-bottom: 13px;
}
.sb-level-list { display: flex; flex-direction: column; gap: 7px; }
.sb-lvl-btn {
  display: flex;
  align-items: center;
  gap: 9px;
  border-radius: 11px;
  padding: 9px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  border: 1px solid transparent;
  text-align: left;
  transition: all 0.2s;
  letter-spacing: 0.1px;
}
.sb-lvl-btn:hover {
  transform: translateX(5px);
  filter: brightness(1.15);
}
.sb-lvl-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.sb-lvl-count {
  margin-left: auto;
  font-size: 11px;
  opacity: 0.5;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* ── QUIZ LAYOUT ── */
.sb-quiz-page {
  min-height: calc(100vh - 62px);
  display: flex;
  flex-direction: column;
}
.sb-quiz-body {
  flex: 1;
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  padding: 28px 24px 80px;
}

/* Quiz topbar (inside body) */
.sb-quiz-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 12px;
}
.sb-back {
  background: rgba(139,92,246,0.08);
  border: 1px solid rgba(139,92,246,0.25);
  border-radius: 10px;
  color: #a78bfa;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 16px;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s;
}
.sb-back:hover { background: rgba(139,92,246,0.15); border-color: rgba(139,92,246,0.45); }

.sb-chips { display: flex; gap: 7px; flex-wrap: wrap; }
.sb-chip {
  border-radius: 99px;
  padding: 5px 13px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  border: 1px solid transparent;
  letter-spacing: 0.2px;
}
.sb-score-chip {
  font-family: 'Syne', sans-serif;
  font-size: 13.5px;
  color: #c4b5fd;
  background: rgba(196,181,253,0.07);
  border: 1px solid rgba(196,181,253,0.2);
  border-radius: 10px;
  padding: 7px 15px;
  font-weight: 700;
}

/* Progress */
.sb-prog-row {
  display: flex;
  justify-content: space-between;
  font-size: 11.5px;
  color: #5e5880;
  margin-bottom: 8px;
  letter-spacing: 0.3px;
}
.sb-prog-track {
  height: 3px;
  background: rgba(139,92,246,0.1);
  border-radius: 99px;
  margin-bottom: 30px;
  overflow: hidden;
}
.sb-prog-fill {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, #a78bfa, #7c3aed, #4c1d95);
  transition: width 0.55s cubic-bezier(.4,0,.2,1);
  box-shadow: 0 0 8px rgba(139,92,246,0.5);
}

/* Question card */
.sb-q-card {
  background: #13131f;
  border: 1px solid rgba(139,92,246,0.18);
  border-radius: 20px;
  padding: 30px 28px 26px;
  margin-bottom: 14px;
  position: relative;
  overflow: hidden;
}
.sb-q-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, #7c3aed, #a78bfa, #7c3aed);
  background-size: 200%;
  animation: shimmer 3s linear infinite;
}
@keyframes shimmer { 0%{background-position:0%} 100%{background-position:200%} }

.sb-q-label {
  font-family: 'Syne', sans-serif;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #7c3aed;
  margin-bottom: 13px;
}
.sb-q-text {
  font-size: 19px;
  font-weight: 500;
  color: #f0eeff;
  line-height: 1.55;
  letter-spacing: -0.2px;
}

/* Options */
.sb-opts { display: flex; flex-direction: column; gap: 9px; margin-bottom: 14px; }
.sb-opt {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 17px;
  border-radius: 13px;
  font-size: 14.5px;
  cursor: pointer;
  text-align: left;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  background: #13131f;
  border: 1px solid rgba(139,92,246,0.16);
  color: #a59fc7;
  width: 100%;
  transition: all 0.18s;
  letter-spacing: 0.1px;
}
.sb-opt.live:hover {
  border-color: rgba(139,92,246,0.42);
  background: rgba(139,92,246,0.07);
  color: #f0eeff;
  transform: translateX(4px);
}
.sb-opt.correct {
  background: rgba(52,211,153,0.08);
  border-color: rgba(52,211,153,0.45);
  color: #34d399;
}
.sb-opt.wrong {
  background: rgba(248,113,113,0.08);
  border-color: rgba(248,113,113,0.4);
  color: #f87171;
}
.sb-opt.dimmed { opacity: 0.38; cursor: default; }
.sb-opt-mark {
  width: 30px; height: 30px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 11.5px;
  font-weight: 800;
  flex-shrink: 0;
  font-family: 'Syne', sans-serif;
  background: rgba(139,92,246,0.1);
  color: #8b5cf6;
  transition: all 0.18s;
}
.sb-opt.correct .sb-opt-mark { background: rgba(52,211,153,0.14); color: #34d399; }
.sb-opt.wrong   .sb-opt-mark { background: rgba(248,113,113,0.14); color: #f87171; }

/* Explanation */
.sb-expl {
  background: #13131f;
  border: 1px solid rgba(139,92,246,0.2);
  border-left: 3px solid #7c3aed;
  border-radius: 15px;
  padding: 20px 22px;
  margin-bottom: 14px;
}
.sb-expl-ttl {
  font-family: 'Syne', sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 9px;
}
.sb-expl-body {
  font-size: 14px;
  color: #a59fc7;
  line-height: 1.68;
  margin-bottom: 18px;
}
.sb-btn-primary {
  background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #4c1d95 100%);
  color: #fff;
  border: none;
  border-radius: 11px;
  padding: 12px 28px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Syne', sans-serif;
  letter-spacing: 0.3px;
  transition: opacity 0.18s, transform 0.18s;
  box-shadow: 0 4px 24px rgba(109,40,217,0.38);
}
.sb-btn-primary:hover { opacity: 0.87; transform: translateY(-2px); }
.sb-btn-ghost {
  background: rgba(139,92,246,0.09);
  color: #a78bfa;
  border: 1px solid rgba(139,92,246,0.28);
  border-radius: 11px;
  padding: 12px 22px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.18s;
}
.sb-btn-ghost:hover { background: rgba(139,92,246,0.17); border-color: rgba(139,92,246,0.48); }

/* ── RESULTS ── */
.sb-results-body {
  max-width: 600px;
  margin: 0 auto;
  padding: 44px 22px 80px;
}
.sb-results-card {
  background: #13131f;
  border: 1px solid rgba(139,92,246,0.18);
  border-radius: 24px;
  padding: 48px 36px 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.sb-results-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, #a78bfa, #7c3aed, #4c1d95);
  border-radius: 24px 24px 0 0;
}
.sb-results-halo {
  position: absolute;
  top: -80px; left: 50%; transform: translateX(-50%);
  width: 340px; height: 340px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(109,40,217,0.16) 0%, transparent 65%);
  pointer-events: none;
}
.sb-results-emoji { font-size: 60px; display: block; margin-bottom: 16px; position: relative; }
.sb-results-grade {
  font-family: 'Syne', sans-serif;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.8px;
  margin-bottom: 6px;
  position: relative;
}
.sb-results-context {
  font-size: 13px;
  color: #5e5880;
  margin-bottom: 30px;
  letter-spacing: 0.3px;
  position: relative;
}
.sb-score-box {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  background: rgba(139,92,246,0.09);
  border: 1px solid rgba(139,92,246,0.22);
  border-radius: 18px;
  padding: 18px 36px;
  margin-bottom: 8px;
  position: relative;
}
.sb-score-n {
  font-family: 'Syne', sans-serif;
  font-size: 56px;
  font-weight: 800;
  background: linear-gradient(135deg, #c4b5fd, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}
.sb-score-d { font-size: 22px; color: #5e5880; }
.sb-score-pct {
  font-family: 'Syne', sans-serif;
  font-size: 19px;
  font-weight: 700;
  margin-bottom: 30px;
  position: relative;
}
.sb-bk {
  text-align: left;
  max-height: 230px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 28px;
  padding-right: 4px;
}
.sb-bk-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 9px 13px;
  border-radius: 10px;
  font-size: 13px;
}
.sb-bk-icon { font-size: 13px; font-weight: 800; flex-shrink: 0; margin-top: 1px; }
.sb-bk-q { color: #a59fc7; line-height: 1.4; }
.sb-results-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; position: relative; }

/* ── SAVE / SHARE BUTTONS ── */
.sb-btn-save {
  background: rgba(52,211,153,0.10);
  color: #34d399;
  border: 1px solid rgba(52,211,153,0.35);
  border-radius: 11px;
  padding: 12px 22px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.18s;
  display: flex;
  align-items: center;
  gap: 7px;
}
.sb-btn-save:hover { background: rgba(52,211,153,0.18); border-color: rgba(52,211,153,0.55); }
.sb-btn-save.saved { opacity: 0.6; cursor: default; }

.sb-btn-share {
  background: rgba(139,92,246,0.09);
  color: #a78bfa;
  border: 1px solid rgba(139,92,246,0.28);
  border-radius: 11px;
  padding: 12px 22px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.18s;
  display: flex;
  align-items: center;
  gap: 7px;
}
.sb-btn-share:hover { background: rgba(139,92,246,0.17); border-color: rgba(139,92,246,0.48); }

/* Toast feedback */
.sb-toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a2e;
  border: 1px solid rgba(139,92,246,0.35);
  border-radius: 12px;
  padding: 12px 22px;
  font-size: 13.5px;
  font-weight: 600;
  color: #c4b5fd;
  z-index: 999;
  animation: sbUp 0.3s cubic-bezier(.4,0,.2,1) both;
  box-shadow: 0 8px 32px rgba(76,29,149,0.35);
  pointer-events: none;
}

/* ── MANAGE SCREEN ── */
.sb-lvl-row { display: flex; align-items: center; gap: 6px; }
.sb-edit-btn {
  background: rgba(139,92,246,0.08);
  border: 1px solid rgba(139,92,246,0.22);
  border-radius: 8px;
  color: #8b5cf6;
  cursor: pointer;
  font-size: 13px;
  padding: 6px 10px;
  flex-shrink: 0;
  transition: all 0.2s;
}
.sb-edit-btn:hover { background: rgba(139,92,246,0.18); border-color: rgba(139,92,246,0.45); }
.sb-manage-header { margin-bottom: 24px; }
.sb-manage-title {
  font-family: 'Syne', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #f0eeff;
  letter-spacing: -0.4px;
  margin-bottom: 4px;
}
.sb-manage-sub { font-size: 13px; color: #5e5880; }
.sb-manage-list { display: flex; flex-direction: column; gap: 10px; }
.sb-manage-item {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #13131f;
  border: 1px solid rgba(139,92,246,0.16);
  border-radius: 14px;
  padding: 16px 18px;
  transition: border-color 0.2s;
}
.sb-manage-item:hover { border-color: rgba(139,92,246,0.32); }
.sb-manage-num {
  font-family: 'Syne', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #7c3aed;
  min-width: 22px;
  flex-shrink: 0;
}
.sb-manage-q { flex: 1; font-size: 14px; color: #a59fc7; line-height: 1.45; }
.sb-delete-btn {
  background: rgba(248,113,113,0.08);
  border: 1px solid rgba(248,113,113,0.25);
  border-radius: 8px;
  color: #f87171;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  padding: 6px 11px;
  flex-shrink: 0;
  transition: all 0.18s;
}
.sb-delete-btn:hover { background: rgba(248,113,113,0.16); border-color: rgba(248,113,113,0.45); }
.sb-manage-empty { text-align: center; padding: 48px 24px; color: #5e5880; font-size: 14px; }
.sb-reorder-btns { display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; }
.sb-reorder-btn {
  background: rgba(139,92,246,0.08);
  border: 1px solid rgba(139,92,246,0.22);
  border-radius: 6px;
  color: #8b5cf6;
  cursor: pointer;
  font-size: 10px;
  padding: 3px 7px;
  line-height: 1;
  transition: all 0.18s;
}
.sb-reorder-btn:hover { background: rgba(139,92,246,0.2); border-color: rgba(139,92,246,0.5); }
.sb-reorder-btn:disabled { opacity: 0.2; cursor: default; }

/* ── ANIMATIONS ── */
.sb-a0 { animation: sbUp 0.36s cubic-bezier(.4,0,.2,1) both; animation-delay: 0ms;   }
.sb-a1 { animation: sbUp 0.36s cubic-bezier(.4,0,.2,1) both; animation-delay: 60ms;  }
.sb-a2 { animation: sbUp 0.36s cubic-bezier(.4,0,.2,1) both; animation-delay: 120ms; }
.sb-a3 { animation: sbUp 0.36s cubic-bezier(.4,0,.2,1) both; animation-delay: 180ms; }
.sb-a4 { animation: sbUp 0.36s cubic-bezier(.4,0,.2,1) both; animation-delay: 240ms; }
.sb-fade { animation: sbUp 0.38s cubic-bezier(.4,0,.2,1) both; }

@keyframes sbUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0);    }
}
`;

// ─────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────
export default function StudyBuddyQuiz() {
  const [quizData, setQuizData]               = useState(QUIZ_DATA);
  const [managingSubject, setManagingSubject] = useState(null);
  const [managingLevel, setManagingLevel]     = useState(null);
  const [screen, setScreen]                   = useState("home");
  const [selectedSubject, setSubject]         = useState(null);
  const [selectedLevel, setLevel]             = useState(null);
  const [questions, setQuestions]             = useState([]);
  const [currentQ, setCurrentQ]               = useState(0);
  const [selectedAnswer, setSelectedAnswer]   = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore]                     = useState(0);
  const [answers, setAnswers]                 = useState([]);
  const [animKey, setAnimKey]                 = useState(0);
  const [toast, setToast]                     = useState(null);
  const [quizSaved, setQuizSaved]             = useState(false);

  const totalQ = SUBJECTS.reduce((t,s)=> t + LEVELS.reduce((t2,l)=> t2+(quizData[s]?.[l]?.length||0),0),0);

  const startQuiz = (subject, level) => {
    const qs = quizData[subject]?.[level];
    if (!qs?.length) return;
    setSubject(subject); setLevel(level);
    setQuestions(qs); setCurrentQ(0);
    setSelectedAnswer(null); setShowExplanation(false);
    setScore(0); setAnswers([]);
    setAnimKey(k=>k+1);
    setQuizSaved(false);
    setScreen("quiz");
  };

  const handleAnswer = (idx) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
    const ok = idx === questions[currentQ].answer;
    if (ok) setScore(s=>s+1);
    setAnswers(a=>[...a,{chosen:idx, correct:ok}]);
  };

  const nextQ = () => {
    if (currentQ+1 >= questions.length) { setScreen("results"); return; }
    setCurrentQ(q=>q+1);
    setSelectedAnswer(null); setShowExplanation(false);
    setAnimKey(k=>k+1);
  };

  const openManage = (subject, level) => {
    setManagingSubject(subject);
    setManagingLevel(level);
    setScreen("manage");
  };

  const reorderQuestion = (subject, level, fromIndex, direction) => {
    const toIndex = fromIndex + direction;
    setQuizData(prev => {
      const list = [...prev[subject][level]];
      const [moved] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, moved);
      return { ...prev, [subject]: { ...prev[subject], [level]: list } };
    });
  };

  const deleteQuestion = (subject, level, qIndex) => {
    setQuizData(prev => {
      const updated = { ...prev };
      updated[subject] = { ...updated[subject] };
      updated[subject][level] = updated[subject][level].filter((_, i) => i !== qIndex);
      return updated;
    });
  };

  const MARKS = ["A","B","C","D"];

  // ── HOME ──────────────────────────────────
  if (screen === "home") return (
    <div className="sb-root">
      <style>{CSS}</style>
      <div className="sb-inner">
        <nav className="sb-nav">
          <div style={{display:"flex",alignItems:"baseline"}}>
            <span className="sb-logo">StudyBuddy</span>
            <span className="sb-nav-tag">Quiz</span>
          </div>
          <div className="sb-nav-meta">
            <span className="sb-nav-dot"/>
            {totalQ} questions available
          </div>
        </nav>

        <div className="sb-hero sb-fade">
          <div className="sb-eyebrow">
            <span className="sb-eyebrow-dot"/>
            Adaptive Learning Platform
          </div>
          <h1 className="sb-hero-title">
            Master Every<br/><em>Subject.</em>
          </h1>
          <p className="sb-hero-sub">
            Sharpen your skills with curated quizzes across math, physics, and science — from high school to advanced university level.
          </p>
          <div className="sb-stats">
            <div className="sb-stat">
              <div className="sb-stat-n">5</div>
              <div className="sb-stat-l">Subjects</div>
            </div>
            <div className="sb-stat">
              <div className="sb-stat-n">4</div>
              <div className="sb-stat-l">Levels</div>
            </div>
            <div className="sb-stat">
              <div className="sb-stat-n">{totalQ}</div>
              <div className="sb-stat-l">Questions</div>
            </div>
          </div>
        </div>

        <div className="sb-grid">
          {SUBJECTS.map((subj, si) => {
            const levelCount = LEVELS.filter(l=>QUIZ_DATA[subj]?.[l]?.length).length;
            const qCount = LEVELS.reduce((t,l)=>t+(QUIZ_DATA[subj]?.[l]?.length||0),0);
            return (
              <div key={subj} className={`sb-card sb-a${Math.min(si,4)}`}>
                <span className="sb-card-icon">{SUBJECT_META[subj].icon}</span>
                <div className="sb-card-title">{subj}</div>
                <div className="sb-card-count">{qCount} questions · {levelCount} difficulty levels</div>
                <div className="sb-card-hr"/>
                <div className="sb-level-list">
                  {LEVELS.map(level=>{
                    const qs = quizData[subj]?.[level];
                    if (!qs?.length) return null;
                    const lm = LEVEL_META[level];
                    return (
                      <div key={level} className="sb-lvl-row">
                        <button className="sb-lvl-btn"
                          style={{background:lm.bg, color:lm.color, borderColor:lm.border, flex:1}}
                          onClick={()=>startQuiz(subj,level)}
                        >
                          <span className="sb-lvl-dot" style={{background:lm.color}}/>
                          {level}
                          <span className="sb-lvl-count">{qs.length} Q</span>
                        </button>
                        <button className="sb-edit-btn" onClick={()=>openManage(subj,level)} title="Manage questions">✎</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── MANAGE ────────────────────────────────
  if (screen === "manage") {
    const qs = quizData[managingSubject]?.[managingLevel] || [];
    const lm = LEVEL_META[managingLevel];
    return (
      <div className="sb-root">
        <style>{CSS}</style>
        <div className="sb-inner">
          <nav className="sb-nav">
            <div style={{display:"flex",alignItems:"baseline"}}>
              <span className="sb-logo">StudyBuddy</span>
              <span className="sb-nav-tag">Manage</span>
            </div>
          </nav>
          <div className="sb-quiz-body">
            <div className="sb-quiz-top sb-fade">
              <button className="sb-back" onClick={()=>setScreen("home")}>← Back to Subjects</button>
              <div className="sb-chips">
                <span className="sb-chip" style={{background:"rgba(255,255,255,0.04)",color:"#a59fc7",borderColor:"rgba(139,92,246,0.18)"}}>
                  {SUBJECT_META[managingSubject].icon} {managingSubject}
                </span>
                <span className="sb-chip" style={{background:lm.bg, color:lm.color, borderColor:lm.border}}>
                  {managingLevel}
                </span>
              </div>
            </div>
            <div className="sb-manage-header">
              <div className="sb-manage-title">Manage Questions</div>
              <div className="sb-manage-sub">{qs.length} question{qs.length!==1?"s":""} · click ✕ to delete</div>
            </div>
            <div className="sb-manage-list">
              {qs.length === 0
                ? <div className="sb-manage-empty">No questions remaining in this set.</div>
                : qs.map((q, i) => (
                    <div key={q.id} className="sb-manage-item sb-fade">
                      <div className="sb-reorder-btns">
                        <button className="sb-reorder-btn" disabled={i===0} onClick={()=>reorderQuestion(managingSubject, managingLevel, i, -1)} title="Move up">▲</button>
                        <button className="sb-reorder-btn" disabled={i===qs.length-1} onClick={()=>reorderQuestion(managingSubject, managingLevel, i, 1)} title="Move down">▼</button>
                      </div>
                      <span className="sb-manage-num">{i + 1}</span>
                      <span className="sb-manage-q">{q.question}</span>
                      <button className="sb-delete-btn" onClick={()=>deleteQuestion(managingSubject, managingLevel, i)} title="Delete question">✕</button>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── QUIZ ──────────────────────────────────
  if (screen === "quiz") {
    const q = questions[currentQ];
    const progress = (currentQ/questions.length)*100;
    const isLast = currentQ+1===questions.length;
    const lm = LEVEL_META[selectedLevel];

    return (
      <div className="sb-root" key={animKey}>
        <style>{CSS}</style>
        <div className="sb-inner">
          <nav className="sb-nav">
            <div style={{display:"flex",alignItems:"baseline"}}>
              <span className="sb-logo">StudyBuddy</span>
              <span className="sb-nav-tag">Quiz</span>
            </div>
            <div className="sb-score-chip">
              {score}&thinsp;/&thinsp;{currentQ+(selectedAnswer!==null?1:0)} correct
            </div>
          </nav>

          <div className="sb-quiz-body">
            <div className="sb-quiz-top sb-fade">
              <button className="sb-back" onClick={()=>setScreen("home")}>← Back to Subjects</button>
              <div className="sb-chips">
                <span className="sb-chip" style={{background:"rgba(255,255,255,0.04)",color:"#a59fc7",borderColor:"rgba(139,92,246,0.18)"}}>
                  {SUBJECT_META[selectedSubject].icon} {selectedSubject}
                </span>
                <span className="sb-chip" style={{background:lm.bg, color:lm.color, borderColor:lm.border}}>
                  {selectedLevel}
                </span>
              </div>
            </div>

            <div className="sb-prog-row">
              <span>Question {currentQ+1} of {questions.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="sb-prog-track">
              <div className="sb-prog-fill" style={{width:`${progress}%`}}/>
            </div>

            <div className="sb-q-card sb-fade">
              <div className="sb-q-label">Question {currentQ+1}</div>
              <div className="sb-q-text">{q.question}</div>
            </div>

            <div className="sb-opts">
              {q.options.map((opt,idx)=>{
                let cls = "sb-opt";
                if (selectedAnswer!==null) {
                  if (idx===q.answer) cls+=" correct";
                  else if (idx===selectedAnswer) cls+=" wrong";
                  else cls+=" dimmed";
                } else cls+=" live";
                return (
                  <button key={idx} className={`${cls} sb-a${idx}`} onClick={()=>handleAnswer(idx)}>
                    <span className="sb-opt-mark">{MARKS[idx]}</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="sb-expl sb-fade">
                <div className="sb-expl-ttl" style={{color: selectedAnswer===q.answer?"#34d399":"#f87171"}}>
                  {selectedAnswer===q.answer ? "✓  Correct" : "✗  Incorrect"}
                </div>
                <p className="sb-expl-body">{q.explanation}</p>
                <button className="sb-btn-primary" onClick={nextQ}>
                  {isLast?"View Results →":"Next Question →"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS ──────────────────────────────
  if (screen === "results") {
    const pct = Math.round((score/questions.length)*100);

    const showToast = (msg) => {
      setToast(msg);
      setTimeout(() => setToast(null), 2500);
    };

    const handleSave = () => {
      if (quizSaved) return;
      const entry = {
        subject: selectedSubject,
        level: selectedLevel,
        score,
        total: questions.length,
        pct,
        date: new Date().toLocaleDateString(),
      };
      const prev = JSON.parse(localStorage.getItem("studybuddy_saved") || "[]");
      localStorage.setItem("studybuddy_saved", JSON.stringify([entry, ...prev]));
      setQuizSaved(true);
      showToast("✓  Quiz result saved!");
    };

    const handleShare = async () => {
      const text = `📊 StudyBuddy Quiz Results\n${SUBJECT_META[selectedSubject].icon} ${selectedSubject} · ${selectedLevel}\n🎯 Score: ${score}/${questions.length} (${pct}%)\n${pct>=90?"🏆 Outstanding!":pct>=70?"🎯 Great Work!":pct>=50?"📖 Keep Practicing":"💪 Don't Give Up!"}`;
      if (navigator.share) {
        try { await navigator.share({ title: "StudyBuddy Quiz", text }); } catch(_) {}
      } else {
        await navigator.clipboard.writeText(text);
        showToast("📋  Results copied to clipboard!");
      }
    };
    const {emoji,grade,color} =
      pct>=90 ? {emoji:"🏆",grade:"Outstanding!",    color:"#c4b5fd"} :
      pct>=70 ? {emoji:"🎯",grade:"Great Work!",     color:"#a78bfa"} :
      pct>=50 ? {emoji:"📖",grade:"Keep Practicing", color:"#fbbf24"} :
               {emoji:"💪",grade:"Don't Give Up!",   color:"#f87171"};

    return (
      <div className="sb-root">
        <style>{CSS}</style>
        <div className="sb-inner">
          <nav className="sb-nav">
            <div style={{display:"flex",alignItems:"baseline"}}>
              <span className="sb-logo">StudyBuddy</span>
              <span className="sb-nav-tag">Results</span>
            </div>
          </nav>
          <div className="sb-results-body">
            <div className="sb-results-card sb-fade">
              <div className="sb-results-halo"/>
              <span className="sb-results-emoji">{emoji}</span>
              <div className="sb-results-grade" style={{color}}>{grade}</div>
              <div className="sb-results-context">
                {SUBJECT_META[selectedSubject].icon}&nbsp;{selectedSubject}&nbsp;·&nbsp;{selectedLevel}
              </div>
              <div className="sb-score-box">
                <span className="sb-score-n">{score}</span>
                <span className="sb-score-d">/ {questions.length}</span>
              </div>
              <div className="sb-score-pct" style={{color}}>{pct}%</div>

              <div className="sb-bk">
                {questions.map((q,i)=>(
                  <div key={q.id} className="sb-bk-row" style={{
                    background: answers[i]?.correct?"rgba(52,211,153,0.08)":"rgba(248,113,113,0.08)",
                    border:`1px solid ${answers[i]?.correct?"rgba(52,211,153,0.2)":"rgba(248,113,113,0.18)"}`,
                  }}>
                    <span className="sb-bk-icon" style={{color:answers[i]?.correct?"#34d399":"#f87171"}}>
                      {answers[i]?.correct?"✓":"✗"}
                    </span>
                    <span className="sb-bk-q">{q.question}</span>
                  </div>
                ))}
              </div>

              <div className="sb-results-actions">
                <button className="sb-btn-primary" onClick={()=>startQuiz(selectedSubject,selectedLevel)}>
                  Retry Quiz
                </button>
                <button className="sb-btn-ghost" onClick={()=>setScreen("home")}>
                  ← All Subjects
                </button>
                <button
                  className={`sb-btn-save${quizSaved?" saved":""}`}
                  onClick={handleSave}
                  title={quizSaved?"Already saved":"Save result"}
                >
                  {quizSaved ? "✓ Saved" : "💾 Save Quiz"}
                </button>
                <button className="sb-btn-share" onClick={handleShare} title="Share result">
                  🔗 Share
                </button>
              </div>
              {toast && <div className="sb-toast">{toast}</div>}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
