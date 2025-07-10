import { HttpRequest, HttpHandlerFn, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


export function authInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {

  const token = localStorage.getItem('authToken');
  

  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }


  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
     
      
      }
      
      return throwError(() => error);
    })
  );
} 