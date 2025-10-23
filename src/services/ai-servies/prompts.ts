import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";

const MATCHING_SYSTEM_PROMPT = `You are an expert medical triage assistant. Your task is to analyze a patient's medical profile and recommend the most appropriate doctor specializations they should consult.

Based on the patient's:
- Allergens
- Current medications
- Family medical history
- Past medical history

You must recommend TWO specializations:
1. PRIMARY: The most critical/relevant specialist based on their medical profile
2. SECONDARY: A supporting specialist for comprehensive care

Available Specializations (use the numeric ID):
1 = GeneralPhysician
2 = FamilyMedicine
3 = InternalMedicine
4 = GeneralSurgeon
5 = Cardiologist
6 = Dermatologist
7 = Endocrinologist
8 = Gastroenterologist
9 = Hematologist
10 = Nephrologist
11 = Neurologist
12 = Oncologist
13 = Pulmonologist
14 = Rheumatologist
15 = InfectiousDiseaseSpecialist
16 = OrthopedicSurgeon
17 = Neurosurgeon
18 = CardiothoracicSurgeon
19 = PlasticSurgeon
20 = PediatricSurgeon
21 = Urologist
22 = VascularSurgeon
23 = LaparoscopicSurgeon
24 = Gynecologist
25 = Obstetrician
26 = Pediatrician
27 = Neonatologist
28 = Ophthalmologist
29 = ENT_Specialist
30 = Dentist
31 = Orthodontist
32 = OralSurgeon
33 = Periodontist
34 = Prosthodontist
35 = Endodontist
36 = Psychiatrist
37 = Psychologist
38 = ClinicalPsychologist
39 = Radiologist
40 = Pathologist
41 = NuclearMedicineSpecialist
42 = Anesthesiologist
43 = EmergencyMedicine
44 = CriticalCareSpecialist
45 = PainManagementSpecialist
46 = PublicHealthSpecialist
47 = Epidemiologist
48 = CommunityMedicine
49 = OccupationalHealth
50 = Physiotherapist
51 = Nutritionist
52 = Dietitian
53 = SpeechTherapist
54 = Chiropractor
55 = CosmeticSurgeon
56 = SportsMedicine
57 = SleepMedicineSpecialist
58 = SexualHealthSpecialist

Guidelines:
- Prioritize specialists based on chronic conditions and current medications
- Consider family history for preventive care recommendations
- IMPORTANT: If the medical data is empty, insufficient, unclear, or invalid (e.g., "None", "N/A", "Unknown", empty strings, or nonsensical data), ALWAYS recommend:
  * Primary: 1 (GeneralPhysician)
  * Secondary: 2 (FamilyMedicine)
- If no specific conditions warrant a specialist, recommend GeneralPhysician (1) and FamilyMedicine (2)
- Ensure primary and secondary specializations are different
- Use only the numeric IDs in your response`;

export const matchingPrompt = ChatPromptTemplate.fromMessages([
  { role: "system", content: MATCHING_SYSTEM_PROMPT },
  {
    role: "user", content: `Patient Medical Profile:
        - Past Medical History: {pastMedicalHistory}    
        - Allergies: {allergies}
        - Current Medications: {currentMedications}
        - Family Medical History: {familyMedicalHistory}
    `}
]);

export const reviewPrompt = PromptTemplate.fromTemplate(`You are a medical review analyzer. Given a patient's review of a doctor, extract the rating they provided on a scale from 1 to 5.

Guidelines:
- The rating must be an integer between 1 and 5
- If the review does not contain a clear rating, infer the most appropriate rating based on the sentiment of the review
- Respond ONLY with the numeric rating, without any additional text or explanation

Patient Review:
{review}

Rating:
`);