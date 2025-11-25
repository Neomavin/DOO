import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse = isHttpException
      ? exception.getResponse()
      : { message: 'Internal server error' };

    const errorPayload = {
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      error: typeof errorResponse === 'string' ? errorResponse : (errorResponse as Record<string, unknown>),
    };

    if (!isHttpException) {
      this.logger.error('Unhandled exception', exception as Error);
    }

    response.status(status).json(errorPayload);
  }
}
