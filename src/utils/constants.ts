type StatusCode = {
    code: number;
    message: string;
};

type StatusCodes = {
    [key: string]: StatusCode;
};

const HttpStatusCode: StatusCodes = {
    HTTP_CONTINUE: {
        code: 100,
        message: "Continue",
    },
    HTTP_SWITCHING_PROTOCOLS: {
        code: 101,
        message: "Switching Protocols",
    },
    HTTP_PROCESSING: {
        code: 102,
        message: "Processing",
    }, // RFC2518
    HTTP_EARLY_HINTS: {
        code: 103,
        message: "Early Hints",
    }, // RFC8297
    HTTP_OK: {
        code: 200,
        message: "OK",
    },
    HTTP_CREATED: {
        code: 201,
        message: "Created",
    },
    HTTP_ACCEPTED: {
        code: 202,
        message: "Accepted",
    },
    HTTP_NON_AUTHORITATIVE_INFORMATION: {
        code: 203,
        message: "Non-Authoritative Information",
    },
    HTTP_NO_CONTENT: {
        code: 204,
        message: "No Content",
    },
    HTTP_RESET_CONTENT: {
        code: 205,
        message: "Reset Content",
    },
    HTTP_PARTIAL_CONTENT: {
        code: 206,
        message: "Partial Content",
    },
    HTTP_MULTI_STATUS: {
        code: 207,
        message: "Multi-Status",
    }, // RFC4918
    HTTP_ALREADY_REPORTED: {
        code: 208,
        message: "Already Reported",
    }, // RFC5842
    HTTP_IM_USED: {
        code: 226,
        message: "IM Used",
    }, // RFC3229
    HTTP_MULTIPLE_CHOICES: {
        code: 300,
        message: "Multiple Choices",
    },
    HTTP_MOVED_PERMANENTLY: {
        code: 301,
        message: "Moved Permanently",
    },
    HTTP_FOUND: {
        code: 302,
        message: "Found",
    },
    HTTP_SEE_OTHER: {
        code: 303,
        message: "See Other",
    },
    HTTP_NOT_MODIFIED: {
        code: 304,
        message: "Not Modified",
    },
    HTTP_USE_PROXY: {
        code: 305,
        message: "Use Proxy",
    },
    HTTP_RESERVED: {
        code: 306,
        message: "Reserved",
    },
    HTTP_TEMPORARY_REDIRECT: {
        code: 307,
        message: "Temporary Redirect",
    },
    HTTP_PERMANENTLY_REDIRECT: {
        code: 308,
        message: "Permanent Redirect",
    }, // RFC7238
    HTTP_BAD_REQUEST: {
        code: 400,
        message: "Bad Request",
    },
    HTTP_UNAUTHORIZED: {
        code: 401,
        message: "Unauthorized",
    },
    HTTP_PAYMENT_REQUIRED: {
        code: 402,
        message: "Payment Required",
    },
    HTTP_FORBIDDEN: {
        code: 403,
        message: "Forbidden",
    },
    HTTP_NOT_FOUND: {
        code: 404,
        message: "Not Found",
    },
    HTTP_METHOD_NOT_ALLOWED: {
        code: 405,
        message: "Method Not Allowed",
    },
    HTTP_NOT_ACCEPTABLE: {
        code: 406,
        message: "Not Acceptable",
    },
    HTTP_PROXY_AUTHENTICATION_REQUIRED: {
        code: 407,
        message: "Proxy Authentication Required",
    },
    HTTP_REQUEST_TIMEOUT: {
        code: 408,
        message: "Request Timeout",
    },
    HTTP_CONFLICT: {
        code: 409,
        message: "Conflict",
    },
    HTTP_GONE: {
        code: 410,
        message: "Gone",
    },
    HTTP_LENGTH_REQUIRED: {
        code: 411,
        message: "Length Required",
    },
    HTTP_PRECONDITION_FAILED: {
        code: 412,
        message: "Precondition Failed",
    },
    HTTP_REQUEST_ENTITY_TOO_LARGE: {
        code: 413,
        message: "Payload Too Large",
    },
    HTTP_REQUEST_URI_TOO_LONG: {
        code: 414,
        message: "URI Too Long",
    },
    HTTP_UNSUPPORTED_MEDIA_TYPE: {
        code: 415,
        message: "Unsupported Media Type",
    },
    HTTP_REQUESTED_RANGE_NOT_SATISFIABLE: {
        code: 416,
        message: "Range Not Satisfiable",
    },
    HTTP_EXPECTATION_FAILED: {
        code: 417,
        message: "Expectation Failed",
    },
    HTTP_I_AM_A_TEAPOT: {
        code: 418,
        message: "I'm a teapot",
    }, // RFC2324
    HTTP_MISDIRECTED_REQUEST: {
        code: 421,
        message: "Misdirected Request",
    }, // RFC7540
    HTTP_UNPROCESSABLE_ENTITY: {
        code: 422,
        message: "Unprocessable Entity",
    }, // RFC4918
    HTTP_LOCKED: {
        code: 423,
        message: "Locked",
    }, // RFC4918
    HTTP_FAILED_DEPENDENCY: {
        code: 424,
        message: "Failed Dependency",
    }, // RFC4918
    HTTP_TOO_EARLY: {
        code: 425,
        message: "Too Early",
    }, // RFC-ietf-httpbis-replay-04
    HTTP_UPGRADE_REQUIRED: {
        code: 426,
        message: "Upgrade Required",
    }, // RFC2817
    HTTP_PRECONDITION_REQUIRED: {
        code: 428,
        message: "Precondition Required",
    }, // RFC6585
    HTTP_TOO_MANY_REQUESTS: {
        code: 429,
        message: "Too Many Requests",
    }, // RFC6585
    HTTP_REQUEST_HEADER_FIELDS_TOO_LARGE: {
        code: 431,
        message: "Request Header Fields Too Large",
    }, // RFC6585
    HTTP_UNAVAILABLE_FOR_LEGAL_REASONS: {
        code: 451,
        message: "Unavailable For Legal Reasons",
    },
    HTTP_INTERNAL_SERVER_ERROR: {
        code: 500,
        message: "Internal Server Error",
    },
    HTTP_NOT_IMPLEMENTED: {
        code: 501,
        message: "Not Implemented",
    },
    HTTP_BAD_GATEWAY: {
        code: 502,
        message: "Bad Gateway",
    },
    HTTP_SERVICE_UNAVAILABLE: {
        code: 503,
        message: "Service Unavailable",
    },
    HTTP_GATEWAY_TIMEOUT: {
        code: 504,
        message: "Gateway Timeout",
    },
    HTTP_VERSION_NOT_SUPPORTED: {
        code: 505,
        message: "Version Not Supported",
    },
    HTTP_VARIANT_ALSO_NEGOTIATES_EXPERIMENTAL: {
        code: 506,
        message: "Variant Also Negotiates (Experimental)",
    }, // RFC2295
    HTTP_INSUFFICIENT_STORAGE: {
        code: 507,
        message: "Insufficient Storage",
    },
    HTTP_LOOP_DETECTED: {
        code: 508,
        message: "loop detected",
    },
    HTTP_NOT_EXTENDED: {
        code: 510,
        message: "Not Extended",
    },
    HTTP_NETWORK_AUTHENTICATION_REQUIRED: {
        code: 511,
        message: "Network Authentication Required",
    },
};

enum Gender {
    MALE = 1,
    FEMALE = 2
}

enum UserType {
    USER = 1,
    DOCTOR = 2,
    HOSPITAL = 3,
    ADMIN = 4
}

enum VerificationDocumentType {
    NATIONAL_ID_CARD = 1,
    PASSPORT = 2,
    OTHER_GOVT_ID = 3
}

enum AccountStatus {
    PENDING = 0,
    ACTIVE = 1,
    SUSPENDED = 2,
    BANNED = 3,
}

enum VerificationType {
    EMAIL_VERIFICATION = 1,
    PASSWORD_RESET = 2
}

enum AdminPrivilege {
    SUPER = 1,
    WRITE = 2,
    READ = 3
}

enum MedicalDegree {
    MBBS = 1,
    BDS = 2,
    DVM = 3,
    PHARM_D = 4,
    DPT = 5,
    BEMS = 6,
    BUMS = 7,
    DHMS = 8
}

enum PostGraduateDegree {
    NONE = 0,
    FCPS = 1,
    MCPS = 2,
    MD = 3,
    MS = 4,
    MDS = 5,
    MPhil = 6,
    MPH = 7,
    PhD = 8
}

enum Specialization {
    // --- General & Family Practice ---
    GeneralPhysician = 1,
    FamilyMedicine = 2,
    InternalMedicine = 3,
    GeneralSurgeon = 4,

    // --- Internal Medicine Subspecialties ---
    Cardiologist = 5,
    Dermatologist = 6,
    Endocrinologist = 7,
    Gastroenterologist = 8,
    Hematologist = 9,
    Nephrologist = 10,
    Neurologist = 11,
    Oncologist = 12,
    Pulmonologist = 13,
    Rheumatologist = 14,
    InfectiousDiseaseSpecialist = 15,

    // --- Surgical Specialties ---
    OrthopedicSurgeon = 16,
    Neurosurgeon = 17,
    CardiothoracicSurgeon = 18,
    PlasticSurgeon = 19,
    PediatricSurgeon = 20,
    Urologist = 21,
    VascularSurgeon = 22,
    LaparoscopicSurgeon = 23,

    // --- Women & Child Health ---
    Gynecologist = 24,
    Obstetrician = 25,
    Pediatrician = 26,
    Neonatologist = 27,

    // --- Eye, ENT, Dental ---
    Ophthalmologist = 28,
    ENT_Specialist = 29,
    Dentist = 30,
    Orthodontist = 31,
    OralSurgeon = 32,
    Periodontist = 33,
    Prosthodontist = 34,
    Endodontist = 35,

    // --- Mental Health ---
    Psychiatrist = 36,
    Psychologist = 37,
    ClinicalPsychologist = 38,

    // --- Diagnostic & Lab ---
    Radiologist = 39,
    Pathologist = 40,
    NuclearMedicineSpecialist = 41,

    // --- Emergency & Intensive Care ---
    Anesthesiologist = 42,
    EmergencyMedicine = 43,
    CriticalCareSpecialist = 44,
    PainManagementSpecialist = 45,

    // --- Public & Preventive Health ---
    PublicHealthSpecialist = 46,
    Epidemiologist = 47,
    CommunityMedicine = 48,
    OccupationalHealth = 49,

    // --- Rehab & Allied Medicine ---
    Physiotherapist = 50,
    Nutritionist = 51,
    Dietitian = 52,
    SpeechTherapist = 53,
    Chiropractor = 54,

    // --- Cosmetic & Misc ---
    CosmeticSurgeon = 55,
    SportsMedicine = 56,
    SleepMedicineSpecialist = 57,
    SexualHealthSpecialist = 58
}

enum DoctorPrefix {
  Dr = 1,
  Prof = 2,
  ProfDr = 3,
  MrDr = 4,
  MsDr = 5,
  MrsDr = 6,
  MxDr = 7,
  AssocProf = 8,
  AsstProf = 9,
  AssocProfDr = 10,
  AsstProfDr = 11,
  RevDr = 12,
  Consultant = 13,
  Surgeon = 14,
}

enum DoctorApplicationStatus {
    PENDING = 0,
    VERIFIED = 1,
    NOT_VERIFIED = 2,
    NOT_FOUND = 3,
    ERROR = 4
}

enum DoctorServiceType {
    IN_PERSON = 1,
    AUDIO_CALL = 2,
    VIDEO_CALL = 3,
}

enum DoctorServiceDuration {
    MIN_30 = 1,
    MIN_45 = 2,
    MIN_60 = 3,
}

enum DayOfWeek {
    SUNDAY = 0,
    MONDAY = 1,
    TUESDAY = 2,
    WEDNESDAY = 3,
    THURSDAY = 4,
    FRIDAY = 5,
    SATURDAY = 6,   
}

export {
    HttpStatusCode,
    Gender,
    UserType,
    VerificationDocumentType,
    AccountStatus,
    VerificationType,
    AdminPrivilege,
    MedicalDegree,
    PostGraduateDegree,
    Specialization,
    DoctorPrefix,
    DoctorApplicationStatus,
    DoctorServiceType,
    DoctorServiceDuration,
    DayOfWeek
}