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
    onClose: () => void;
    job: PipelineJobsModal | null;
}

interface PipelineChartSector {
    name: string;
    value: number;
}

interface PipelineChartEnvironmentData {
    [key: string]: PipelineChartSector[];
}
interface PipelineChartsData {
    pipeline : PipelineChartEnvironmentData;
    jobs: PipelineChartEnvironmentData;
}

interface Pipeline {
    id: string;
    jobName: string;
    cbVersion: string;
    cpVersion: string;
    commitUrl: string;
    result: string;
    duration: number;
    runDate: number;
    description: string;
    url: string;
}

interface Pipelines {
    [key: string]: Pipeline[];
}

interface TestCaseDetails {
    className: string;
    duration: number;
    errorDetails: string | null;
    errorStackTrace: string | null;
    name: string;
    status: string;
    suite: string;
}

interface TestCaseDetailsModalProps {
    testName: string;
    result: string;
    docId: string;
    isModalOpen: boolean;
    onClose: () => void;
}

interface TestCaseDetailModal {
    testName: string;
    docId: string;
}