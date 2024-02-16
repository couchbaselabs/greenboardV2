interface PipelineJobData {
    id: string,
    result: string;
    totalCount: number;
    failCount: number;
    passCount: number;
    runDate: number;
    duration: number;
    url: string
    provider: string;
    component: string;
}

interface PipelineJobs {
    [key : string]: PipelineJobData[];
}

interface PipelineJob {
    id: string,
    jobName: string;
    url: string;
    cpVersion: string;
    cbVersion: string;
    commitUrl: string;
    result: string;
    duration: number;
    description: string;
    runDate: number;
    jobs: PipelineJobs;
}

interface EnvironmentData {
    duration: number;
    jobCount: number;
    jobs: PipelineJob[];
}

interface PipelineData {
    [key: string]: EnvironmentData;
}

interface PipelineProps {
    jobs: PipelineJob[];
    loading: boolean;
}

interface PipelineJobsModal {
    jobName: string,
    jobs: PipelineJobData[];
}

interface PipelineJobDetailsModalProps {
    open: boolean;
    onClose: any;
    job: PipelineJobsModal | null;
}

