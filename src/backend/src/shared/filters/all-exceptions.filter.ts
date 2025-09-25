import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload: Record<string, any> = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request?.url,
      message: isHttp
        ? (exception as HttpException).message
        : 'Internal server error',
    };

    if (process.env.NODE_ENV !== 'production') {
      payload.error =
        exception instanceof Error
          ? { name: exception.name, message: exception.message, stack: exception.stack }
          : exception;
    }

    response.status(status).json(payload);
  }
}
