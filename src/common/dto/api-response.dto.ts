export class ApiResponseDto {
  constructor(
    data: any,
    isError: boolean,
    message: string,
    errorDetails: any,
    responseCode: number,
  ) {
    this.data = data;
    this.isError = isError;
    this.message = message;
    this.errorDetails = errorDetails;
    this.responseCode = responseCode;
  }

  data: any;
  isError: boolean;
  message: string;
  errorDetails: any;
  responseCode: number;
}
