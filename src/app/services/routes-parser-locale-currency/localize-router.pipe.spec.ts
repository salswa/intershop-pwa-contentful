import { ChangeDetectorRef, Injector } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs/Subject';
import { anyString, instance, mock, when } from 'ts-mockito';
import { equals, LocalizeRouterPipe } from './localize-router.pipe';
import { LocalizeRouterService } from './localize-router.service';

describe('LocalizeRouterPipe', () => {
  let injector: Injector;
  let localize: LocalizeRouterService;
  let localizePipe: LocalizeRouterPipe;
  let mockedRef: ChangeDetectorRef;
  let ref: any;
  const localizeRouterServiceMock: any = mock(LocalizeRouterService);
  const mockLocalizeRouterService = instance(localizeRouterServiceMock);
  mockLocalizeRouterService.routerEvents = new Subject<string>();
  when(localizeRouterServiceMock.translateRoute(anyString())).thenCall((route: string) => {
    return route + '_TR';
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LocalizeRouterPipe],
      providers: [
        {
          provide: LocalizeRouterService, useFactory: () => mockLocalizeRouterService
        }
      ]
    });
    injector = getTestBed();
    localize = injector.get(LocalizeRouterService);
    mockedRef = mock(ChangeDetectorRef);
    ref = instance(mockedRef);
    // ref = new FakeChangeDetectorRef();
    localizePipe = new LocalizeRouterPipe(localize, ref);
  });

  afterEach(() => {
    injector = undefined;
    localize = undefined;
    localizePipe = undefined;
  });

  it('should be created', () => {
    expect(LocalizeRouterPipe).toBeTruthy();
    expect(localizePipe).toBeTruthy();
    expect(localizePipe instanceof LocalizeRouterPipe).toBeTruthy();
  });

  it('should translate a route when called', () => {
    localize.parser.currentLang = 'en';

    expect(localizePipe.transform('route')).toEqual('route_TR');
  });

  it('should translate a multi segment route when called', () => {
    localize.parser.currentLang = 'en';

    expect(localizePipe.transform('path/to/my/route')).toEqual('path/to/my/route_TR');
  });

  it('should translate a complex segment route if it changed', () => {
    localize.parser.currentLang = 'en';
    spyOn(ref, 'markForCheck').and.callThrough();

    localizePipe.transform(['/path', null, 'my', 5]);
    ref.markForCheck.calls.reset();

    localizePipe.transform(['/path', 4, 'my', 5]);
    expect(ref.markForCheck).toHaveBeenCalled();
  });

  it('should not translate a complex segment route if it`s not changed', () => {
    localize.parser.currentLang = 'en';
    spyOn(ref, 'markForCheck').and.callThrough();

    localizePipe.transform(['/path', 4, 'my', 5]);
    ref.markForCheck.calls.reset();

    localizePipe.transform(['/path', 4, 'my', 5]);
    expect(ref.markForCheck).not.toHaveBeenCalled();
  });

  it('should call markForChanges when it translates a string', () => {
    localize.parser.currentLang = 'en';
    spyOn(ref, 'markForCheck').and.callThrough();

    localizePipe.transform('route');
    expect(ref.markForCheck).toHaveBeenCalled();
  });

  it('should not call markForChanges when query is not string', () => {
    localize.parser.currentLang = 'en';
    spyOn(ref, 'markForCheck').and.callThrough();

    localizePipe.transform(null);
    expect(ref.markForCheck).not.toHaveBeenCalled();
  });

  it('should not call markForChanges when query is empty string', () => {
    localize.parser.currentLang = 'en';
    spyOn(ref, 'markForCheck').and.callThrough();

    localizePipe.transform('');
    expect(ref.markForCheck).not.toHaveBeenCalled();
  });

  it('should not call markForChanges when no language selected', () => {
    localize.parser.currentLang = null;
    spyOn(ref, 'markForCheck').and.callThrough();

    localizePipe.transform('route');
    expect(ref.markForCheck).not.toHaveBeenCalled();
  });

  it('should not call markForChanges if same route already translated', () => {
    localize.parser.currentLang = 'en';
    spyOn(ref, 'markForCheck').and.callThrough();
    localizePipe.transform('route');
    localizePipe.transform('route');
    expect(ref.markForCheck.calls.count()).toEqual(1);
  });

  it('should subscribe to service`s routerEvents when emitted', () => {
    const query = 'MY_TEXT';
    localize.parser.currentLang = 'en';
    spyOn(localizePipe, 'transform').and.callThrough();
    spyOn(ref, 'markForCheck').and.callThrough();

    localizePipe.transform(query);
    ref.markForCheck.calls.reset();
    (<any>localizePipe.transform)['calls'].reset();

    localize.parser.currentLang = 'de';
    localize.routerEvents.next('de');
    expect(localizePipe.transform).toHaveBeenCalled();
    expect(ref.markForCheck).toHaveBeenCalled();
  });

  describe('\'Equal method\'', () => {
    it('should return true if same object', () => {
      let a;
      let b;
      a = b = {
        something: true
      };
      const c = 'something else';

      expect(equals(a, b)).toBe(true);
      expect(equals(a, c)).toBe(false);
    });
    it('should return false if one of inputs is null', () => {
      let a;
      let b;
      a = {
        something: true
      };
      b = null;

      expect(equals(a, b)).toBe(false);
      expect(equals(b, a)).toBe(false);
    });
    it('should return true if both are NaN', () => {
      let a;
      let b;
      a = NaN;
      b = NaN;

      expect(equals(a, b)).toBe(true);
    });
    it('should return false if type is different', () => {
      expect(equals(null, 0)).toBe(false);
      expect(equals(null, '')).toBe(false);
      expect(equals(0, false)).toBe(false);
      expect(equals('1', 1)).toBe(false);
      expect(equals('1', '1')).toBe(true);
    });
    it('should return false if only one is Array', () => {
      expect(equals([], {})).toBe(false);
      expect(equals({}, [])).toBe(false);
    });
    it('should return false if array length is different', () => {
      expect(equals([], [1])).toBe(false);
    });
    it('should return false if array elements are different', () => {
      expect(equals([1, 3, 2], [1, 2, 3])).toBe(false);
    });
    it('should return true if array elements are same', () => {
      expect(equals([1, 2, 3], [1, 2, 3])).toBe(true);
    });
    it('should return false if keys dont match', () => {
      expect(equals({ text: 123, same: 1 }, { text: 321, same: 1 })).toBe(false);
      expect(equals({ text: 123 }, { non_text: 123 })).toBe(false);
      expect(equals({ text: 123 }, { text: 123, non_text: 123 })).toBe(false);
      expect(equals({ text: 123, same: 1 }, { text: 123, same: 1 })).toBe(true);
    });
    it('should ignore if inherited fields dont match', () => {
      // tslint:disable-next-line:prefer-mocks-instead-of-stubs-in-tests
      class Class1 {
        same: boolean;

        first() {
        }

        constructor() {
        }
      }

      // tslint:disable-next-line:prefer-mocks-instead-of-stubs-in-tests
      class Class2 {
        same: boolean;

        second() {
        }

        constructor() {
        }
      }

      const instance1: any = new Class1();
      instance1.same = true;
      const instance2: any = new Class2();
      instance2.same = true;

      expect(equals(instance1, instance2)).toBe(true);
    });
  });

});


