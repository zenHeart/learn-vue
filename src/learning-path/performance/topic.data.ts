import { createLearningPathData } from '../learning-path.data'

export declare const data: ReturnType<typeof createLearningPathData>['load'] extends () => Promise<infer T> ? T : never

export default createLearningPathData('performance')
