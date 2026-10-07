import { Request, Response, NextFunction } from 'express';
import { AiService } from '../services/aiService';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../prisma';

export async function chatWithAi(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { message, history = [], language = 'mr' } = req.body;

    if (!message) {
      res.status(400).json({ success: false, error: 'Please say or type something.' });
      return;
    }

    const context = {
      userId: req.user?.id,
      seniorId: req.user?.seniorProfileId,
      language,
      currentTaskSlug: req.body.currentTaskSlug,
      currentStepIndex: req.body.currentStepIndex !== undefined ? Number(req.body.currentStepIndex) : undefined,
      voiceEnabled: req.body.voiceEnabled !== undefined ? Boolean(req.body.voiceEnabled) : true,
      userConfusionLevel: req.body.userConfusionLevel !== undefined ? Number(req.body.userConfusionLevel) : 1,
      lastInstruction: req.body.lastInstruction,
      lastAIResponse: req.body.lastAIResponse,
    };

    const aiResponse = await AiService.chat(message, history, context);

    // Save conversation log if user is logged in
    if (req.user?.seniorProfileId) {
      try {
        let conversation = await prisma.conversation.findFirst({
          where: { seniorId: req.user.seniorProfileId },
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              seniorId: req.user.seniorProfileId,
              title: 'Daily Chat',
            },
          });
        }

        await prisma.conversationMessage.createMany({
          data: [
            {
              conversationId: conversation.id,
              sender: 'SENIOR',
              content: message,
            },
            {
              conversationId: conversation.id,
              sender: 'AI',
              content: aiResponse.reply,
            },
          ],
        });
      } catch (err) {
        console.warn('Could not log conversation message:', err);
      }
    }

    res.json({
      success: true,
      data: aiResponse,
    });
  } catch (error) {
    next(error);
  }
}

export async function checkScamMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { messageText, language = 'mr' } = req.body;

    if (!messageText) {
      res.status(400).json({ success: false, error: 'Please enter the message to check.' });
      return;
    }

    const result = AiService.analyzeMessageSafety(messageText, language);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function explainWebPage(req: Request, res: Response, next: NextFunction) {
  try {
    const { pageTitle = '', url = '', visibleText = '', language = 'mr' } = req.body;

    const explanation = AiService.explainWebPage(pageTitle, url, visibleText, language);

    res.json({
      success: true,
      data: explanation,
    });
  } catch (error) {
    next(error);
  }
}

export async function extractPrescription(req: Request, res: Response, next: NextFunction) {
  try {
    const { rawTextOrDescription = '' } = req.body;

    const result = AiService.extractPrescription(rawTextOrDescription);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
