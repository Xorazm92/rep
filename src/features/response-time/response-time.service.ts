import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, IsNull, Not } from 'typeorm';
// import { QuestionStatus } from '../message-logging/entities/message-log.entity'; // Temporarily commented out
import { MessageLogEntity } from '../message-logging/entities/message-log.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ResponseTimeService {
  private readonly logger = new Logger(ResponseTimeService.name);
  private readonly CLIENTQuestionTimeoutMinutes: number;
  private readonly agentResponseTimeoutMinutes: number;

  constructor(
    @InjectRepository(MessageLogEntity)
    private readonly messageLogRepository: Repository<MessageLogEntity>,
    private readonly configService: ConfigService,
  ) {
    this.CLIENTQuestionTimeoutMinutes = this.configService.get<number>(
      'CLIENT_QUESTION_TIMEOUT_MINUTES',
      10,
    );
    this.agentResponseTimeoutMinutes = this.configService.get<number>(
      'AGENT_RESPONSE_TIMEOUT_MINUTES',
      5,
    );
  }

  // O‘zbekiston vaqti bilan har kuni soat 09:00 da ishlaydi (UTC 04:00)
  @Cron('0 4 * * *')
  async handleTimedOutCLIENTQuestions() {
    this.logger.debug('Running cron job: handleTimedOutCLIENTQuestions');
    // O‘zbekiston vaqti (UTC+5) bilan timeoutThreshold hisoblash
    const nowUzb = new Date(Date.now() + 5 * 60 * 60 * 1000);
    const timeoutThreshold = new Date(nowUzb.getTime() - this.CLIENTQuestionTimeoutMinutes * 60 * 1000);

    // const pendingCLIENTQuestions = await this.messageLogRepository.find({
    //   where: {
    //     isQuestion: true,
    //     // questionStatus: QuestionStatus.PENDING, // Temporarily commented out
    //     questionStatusTemp: 'PENDING', // Using temp field
    //     directionTemp: 'INCOMING',
    //     timestamp: LessThan(timeoutThreshold),
    //     // For filtering by user role, you'd need a subquery or filter after fetching if using TypeORM query builder directly for many-to-many
    //     // Example post-fetch filter:
    //     // user: { chatRoles: { role: UserRole.ACCOUNTANT } } // This specific syntax might not work directly in `find` options for complex relations
    //   },
    //   relations: ['user', 'user.chatRoles', 'user.chatRoles.role'], // Ensure relations are loaded
    // });

    // for (const question of pendingCLIENTQuestions) {
    //   // if (question.user && question.user.chatRoles && question.user.chatRoles.some(chatRole => chatRole.role === UserRole.ACCOUNTANT)) { // Check role correctly
    //   //   this.logger.log(`ACCOUNTANT question ID ${question.id} from user ${question.user.telegramId} has timed out.`);
    //   //   // question.questionStatus = QuestionStatus.TIMEOUT_CLIENT; // Temporarily commented out
    //   //   question.questionStatusTemp = 'TIMEOUT_ACCOUNTANT'; // Using temp field
    //   //   await this.messageLogRepository.save(question);
    //   // }
    // }
  }

  // O‘zbekiston vaqti bilan har kuni soat 17:00 da ishlaydi (UTC 12:00)
  @Cron('0 12 * * *')
  async handleTimedOutAgentResponses() {
    this.logger.debug('Running cron job: handleTimedOutAgentResponses');
    // O‘zbekiston vaqti (UTC+5) bilan timeoutThreshold hisoblash
    const nowUzb = new Date(Date.now() + 5 * 60 * 60 * 1000);
    const timeoutThreshold = new Date(nowUzb.getTime() - this.agentResponseTimeoutMinutes * 60 * 1000);
    // const pendingAgentQuestions = await this.messageLogRepository.find({
    //   where: {
    //     isQuestion: true,
    //     // questionStatus: QuestionStatus.PENDING, // Temporarily commented out
    //     questionStatusTemp: 'PENDING',
    //     timestamp: LessThan(timeoutThreshold),
    //   },
    //   relations: ['user', 'user.chatRoles', 'user.chatRoles.role'],
    // });

    // for (const question of pendingAgentQuestions) {
    //   this.logger.log(`Agent response for question ID ${question.id} (originally from ${question.user?.telegramId}) may be timed out.`);
    //   // question.questionStatus = QuestionStatus.TIMEOUT_AGENT; // Temporarily commented out
    //   question.questionStatusTemp = 'TIMEOUT_AGENT';
    //   // await this.messageLogRepository.save(question);
    // }
  }

  async checkForUnansweredFollowUps(messageLog: MessageLogEntity) {
    if (
      !messageLog.user ||
      !messageLog.user.chatRoles ||
      !messageLog.user.chatRoles.some(
        (chatRole) => chatRole.role === UserRole.ACCOUNTANT,
      ) ||
      !messageLog.isQuestion
    ) {
      return;
    }

    // const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    // const recentAnsweredQuestions = await this.messageLogRepository.find({
    //   where: {
    //     chatId: messageLog.chatId,
    //     user: { id: messageLog.user.id },
    //     isQuestion: true,
    //     // questionStatus: QuestionStatus.ANSWERED, // Temporarily commented out
    //     questionStatusTemp: 'ANSWERED',
    //     timestamp: MoreThan(fiveMinutesAgo),
    //     id: Not(messageLog.id),
    //   },
    //   order: { timestamp: 'DESC' },
    //   take: 1,
    //   relations: ['user'],
    // });

    // if (recentAnsweredQuestions.length > 0) {
    //   const lastAnsweredQuestion = recentAnsweredQuestions[0];
    //   this.logger.log(
    //     `CLIENT ${messageLog.user.telegramId} sent a new message (ID: ${messageLog.id}) after a recent answered question (ID: ${lastAnsweredQuestion.id}). This might be a follow-up.`,
    //   );
    // }
  }
}
