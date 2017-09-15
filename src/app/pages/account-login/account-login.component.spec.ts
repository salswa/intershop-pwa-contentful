import { ComponentFixture } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { TestBed } from '@angular/core/testing';
import { AccountLoginService } from '../../services/account-login/';
import { CacheCustomService } from '../../services/cache/cache-custom.service';
import { CacheService } from 'ng2-cache/ng2-cache';
import { EncryptDecryptService } from '../../services/cache/encrypt-decrypt.service';
import { AccountLoginComponent } from './account-login.component';
import { async } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../modules/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { GlobalConfiguration } from '../../configurations/global.configuration';
import { mock, instance, anyString, when } from 'ts-mockito';
import { LocalizeRouterService } from '../../services/routes-parser-locale-currency/localize-router.service';

describe('AccountLogin Component', () => {
  let fixture: ComponentFixture<AccountLoginComponent>;
  let component: AccountLoginComponent;
  let element: HTMLElement;
  let debugEl: DebugElement;
  let localizeRouterServiceMock: LocalizeRouterService;


  const userData = {
    'type': 'PrivateCustomer',
    'customerNo': 'Patricia',
    'preferredInvoiceToAddress': {
      'type': 'Address',
      'urn': 'urn:address:customer:vTwKAB2YqvEAAAFb8BMYJJBT:I2MKAB2YsVUAAAFb9RMYJJBT',
      'id': 'I2MKAB2YsVUAAAFb9RMYJJBT',
      'addressName': 'customeraddr-ABCDEFGPRMuMCscyXgSRVU',
      'title': 'Ms.',
      'firstName': 'Patricia',
      'lastName': 'Miller',
      'addressLine1': 'Potsdamer Str. 20',
      'postalCode': '14483',
      'phoneHome': '049364112677',
      'country': 'Germany',
      'countryCode': 'DE',
      'city': 'Berlin',
      'usage': [
        true,
        true
      ],
      'invoiceToAddress': true,
      'shipFromAddress': false,
      'serviceToAddress': false,
      'installToAddress': false,
      'shipToAddress': true,
      'street': 'Potsdamer Str. 20'
    },
    'preferredShipToAddress': {
      'type': 'Address',
      'urn': 'urn:address:customer:vTwKAB2YqvEAAAFb8BMYJJBT:I2MKAB2YsVUAAAFb9RMYJJBT',
      'id': '.uUKAB2YsVEAAAFb9RMYJJBT',
      'addressName': 'customeraddr-YXEwLKSprCWPRMuMCscyXgSRVU',
      'title': 'Ms.',
      'firstName': 'Patricia',
      'lastName': 'Miller',
      'addressLine1': 'Berliner Str. 20',
      'postalCode': '14482',
      'phoneHome': '049364112677',
      'country': 'Germany',
      'countryCode': 'DE',
      'city': 'Potsdam',
      'usage': [
        true,
        true
      ],
      'invoiceToAddress': true,
      'shipFromAddress': false,
      'serviceToAddress': false,
      'installToAddress': false,
      'shipToAddress': true,
      'street': 'Berliner Str. 20'
    },
    'title': '',
    'firstName': 'Patricia',
    'lastName': 'Miller',
    'phoneHome': '',
    'phoneBusiness': '',
    'phoneMobile': '',
    'fax': '',
    'email': 'patricia@test.intershop.de',
    'hasRole': true
  };

  class MockAccountLoginService {
    singinUser(userDetails) {
      if (userDetails.userName === 'intershop@123.com' && userDetails.password === '123456') {
        return Observable.of(userData);
      } else {
        return Observable.of('Incorrect Credentials');
      }
    }
  }

  class GlobalConfigurationStub {
    getApplicationSettings() {
      const accountSettings = {
        useSimpleAccount: true,
        userRegistrationLoginType: 'email'
      };
      return Observable.of(accountSettings);
    }
  }

  beforeEach(async(() => {
    localizeRouterServiceMock = mock(LocalizeRouterService);
    when(localizeRouterServiceMock.translateRoute(anyString())).thenCall((arg1: string) => {
      return arg1;
    });

    TestBed.configureTestingModule({
      declarations: [
        AccountLoginComponent
      ],
      providers: [
        CacheCustomService, CacheService, EncryptDecryptService,
        { provide: AccountLoginService, useClass: MockAccountLoginService },
        { provide: GlobalConfiguration, useClass: GlobalConfigurationStub },
        { provide: LocalizeRouterService, useFactory: () => instance(localizeRouterServiceMock) }

      ],
      imports: [
        SharedModule,
        TranslateModule.forRoot(),
        RouterTestingModule
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountLoginComponent);
    component = fixture.componentInstance;
    debugEl = fixture.debugElement;
    element = fixture.nativeElement;
    const router = TestBed.get(Router);
    this.navSpy = spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should check if controls are rendered on Login page', () => {
    expect(element.querySelector('#ShopLoginForm_Login')).toBeTruthy();
    expect(element.querySelector('#ShopLoginForm_Password')).toBeTruthy();
    expect(element.getElementsByClassName('btn btn-primary')).toBeTruthy();
  });

  it(`should call onSignIn when loginForm is invalid`, () => {
    const userDetails = { userName: 'intershop@123.com', password: '123456' };
    component.onSignin(userDetails);
    expect(this.navSpy).not.toHaveBeenCalled();
  });

  it(`should call onSignIn when loginForm is valid but credentials are incorrect`, () => {
    const userDetails = { userName: 'intershop@123.com', password: 'wrong' };
    component.loginForm.controls['userName'].setValue('test@test.com');
    component.loginForm.controls['password'].setValue('123213');
    component.onSignin(userDetails);
    expect(component.errorUser).toEqual('Incorrect Credentials');
  });

  it(`should call onSignIn when loginForm is valid with correct credentials`, () => {
    const userDetails = { userName: 'intershop@123.com', password: '123456' };
    component.loginForm.controls['userName'].setValue('test@test.com');
    component.loginForm.controls['password'].setValue('123213');
    component.onSignin(userDetails);
    expect(this.navSpy).toHaveBeenCalledWith(['/home']);
  });

  it('should call ngOnInit method', () => {
    expect(component.loginForm).toBeTruthy();
  });

  it('should assign value to Email field to test Email validator', () => {
    component.loginForm.controls['userName'].setValue('test@test.com');
    expect(component.loginForm.controls['userName'].value).toEqual('test@test.com');
  });
});
