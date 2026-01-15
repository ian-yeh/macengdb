export interface Company {
    id: number;
    name: string;
    industry: string;
    location: string;
    rating: number;
    hiringCount: number;
    reviewCount: number;
    description: string;
}

export interface CompanyReview {
    id: number;
    companyId: number;
    position: string;
    rating: number;
    workLifeBalance: number;
    salary: string;
    reviewText: string;
    pros: string;
    cons: string;
    term: string;
    createdAt: string;
}