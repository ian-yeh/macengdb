export interface Company {
    id: number;
    name: string;
    industries: string[];
    rating: number;
    review_count: number;
    created_at: string;
    updated_at: string;
}

export interface Experience {
    id: number;
    company_id: number;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
}