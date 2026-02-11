export interface Company {
    id: number;
    name: string;
    industries: string[];
    rating: number;
    experience_count: number;
    created_at: string;
    updated_at: string;
}

export interface InterviewStage {
    name: string;
    duration?: string;
    questions: string[];
}

export interface Experience {
    id: number;
    user_id: number | null;
    company_id: number;
    submitter_email: string;
    position: string;
    term: string;
    offer_received: boolean;
    difficulty: number;
    stages: InterviewStage[];
    tips: string | null;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface ExperienceSubmitData {
    submitter_email: string;
    company_id: number;
    position: string;
    term: string;
    offer_received: boolean;
    difficulty: number;
    stages: InterviewStage[];
    tips?: string;
}

export interface CompanyRequest {
    id: number;
    name: string;
    requester_email: string | null;
    status: string;
    created_at: string;
}