
import { screen, waitFor, fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';
import NewBill from '../containers/NewBill.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import mockStore from '../__mocks__/store.js';

import router from '../app/Router.js';

jest.mock('../app/Store', () => mockStore);

// integration test POST
export const testNewBillPage = () => {
  describe('Given I am connected as an employee', () => {
    describe('When I am on NewBill Page', () => {
      describe('When I submit newBill', () => {
        beforeEach(() => {
          jest.spyOn(mockStore, 'bills');
          Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
          });
          window.localStorage.setItem(
            'user',
            JSON.stringify({
              type: 'Employee',
              email: 'a@a',
            })
          );
          const root = document.createElement('div');
          root.setAttribute('id', 'root');
          document.body.appendChild(root);
          router();
        });

        test('Then created bill should correspond to mock API POST', async () => {
          window.onNavigate(ROUTES_PATH.NewBill);
          const newBillFile = {
            fileUrl: 'https://localhost:3456/images/test.jpg',
            key: '1234',
          };
          const createNewBill = await mockStore.bills().create(newBillFile);
          expect(mockStore.bills).toHaveBeenCalled();
          expect(createNewBill).toStrictEqual(newBillFile);
        });

        test('Then updated bill should correspond to mock API PUT', async () => {
          window.onNavigate(ROUTES_PATH.NewBill);
          const inputType = screen.getByTestId('expense-type');
          fireEvent.change(inputType, { target: { value: 'Hôtel et logement' } });
          const inputName = screen.getByTestId('expense-name');
          fireEvent.change(inputName, { target: { value: 'encore' } });
          const inputDate = screen.getByTestId('datepicker');
          fireEvent.change(inputDate, { target: { value: '2004-04-04' } });
          const inputAmount = screen.getByTestId('amount');
          fireEvent.change(inputAmount, { target: { value: 400 } });
          const inputVat = screen.getByTestId('vat');
          fireEvent.change(inputVat, { target: { value: '80' } });
          const inputPct = screen.getByTestId('pct');
          fireEvent.change(inputPct, { target: { value: 20 } });
          const inputCommentary = screen.getByTestId('commentary');
          fireEvent.change(inputCommentary, {
            target: { value: 'séminaire billed' },
          });
          const userData = JSON.parse(localStorage.getItem('user'));
          const localEmail = JSON.parse(userData).email;

          const bill = {
            id: '47qAXb6fIm2zOKkLzMro',
            vat: inputVat.value,
            fileUrl:
              'https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a',
            status: 'pending',
            type: inputType.value,
            commentary: inputCommentary.value,
            name: inputName.value,
            fileName: 'preview-facture-free-201801-pdf-1.jpg',
            date: inputDate.value,
            amount: parseInt(inputAmount.value),
            commentAdmin: 'ok',
            email: localEmail,
            pct: parseInt(inputPct.value),
          };
          const updateNewBill = await mockStore.bills().update(bill);
          expect(mockStore.bills).toHaveBeenCalled();
          expect(updateNewBill).toStrictEqual(bill);
        });

        describe('When an error occurs on API', () => {
          test('create bill from an API and fails with 404 message error', async () => {
            window.onNavigate(ROUTES_PATH.NewBill);
            const post = jest.spyOn(console, 'error');
            mockStore.bills.mockImplementation(() => {
              return {
                create: () => {
                  return Promise.reject(new Error('404 Not Found on create'));
                },
              };
            });
            const newBill = new NewBill({
              document,
              onNavigate,
              store: mockStore,
              localStorage,
            });
            const form = screen.getByTestId('form-new-bill');
            const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
            form.addEventListener('submit', handleSubmit);
            fireEvent.submit(form);
            await new Promise(process.nextTick);
            expect(post).toBeCalledWith(new Error('404 Not Found on create'));
            form.removeEventListener('submit', handleSubmit);
            mockStore.bills.mockClear();
          });

          test('create bill from an API and fails with 500 message error', async () => {
            window.onNavigate(ROUTES_PATH.NewBill);
            const post = jest.spyOn(console, 'error');
            mockStore.bills.mockImplementation(() => {
              return {
                create: () => {
                  return Promise.reject(
                    new Error('500 Internal Server Error on create')
                  );
                },
              };
            });
            const newBill = new NewBill({
              document,
              onNavigate,
              store: mockStore,
              localStorage,
            });
            const form = screen.getByTestId('form-new-bill');
            const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
            form.addEventListener('submit', handleSubmit);
            fireEvent.submit(form);
            await new Promise(process.nextTick);
            expect(post).toBeCalledWith(
              new Error('500 Internal Server Error on create')
            );
            form.removeEventListener('submit', handleSubmit);
            mockStore.bills.mockClear();
          });

          test('update bill from an API and fails with 404 message error', async () => {
            window.onNavigate(ROUTES_PATH.NewBill);
            const update = jest.spyOn(console, 'error');
            mockStore.bills.mockImplementation(() => {
              return {
                create: () => {
                  return Promise.resolve({});
                },
                update: () => {
                  return Promise.reject(new Error('404 Not Found on update'));
                },
              };
            });
            const newBill = new NewBill({
              document,
              onNavigate,
              store: mockStore,
              localStorage,
            });
            const form = screen.getByTestId('form-new-bill');
            const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
            form.addEventListener('submit', handleSubmit);
            fireEvent.submit(form);
            await new Promise(process.nextTick);
            expect(update).toBeCalledWith(new Error('404 Not Found on update'));
            form.removeEventListener('submit', handleSubmit);
            mockStore.bills.mockClear();
          });

          test('update bill from an API and fails with 500 message error', async () => {
            window.onNavigate(ROUTES_PATH.NewBill);
            const update = jest.spyOn(console, 'error');
            mockStore.bills.mockImplementation(() => {
              return {
                create: () => {
                  return Promise.resolve({});
                },
                update: () => {
                  return Promise.reject(
                    new Error('500 Internal Server Error on update')
                  );
                },
              };
            });
            const newBill = new NewBill({
              document,
              onNavigate,
              store: mockStore,
              localStorage,
            });
            const form = screen.getByTestId('form-new-bill');
            const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
            form.addEventListener('submit', handleSubmit);
            fireEvent.submit(form);
            await new Promise(process.nextTick);
            expect(update).toBeCalledWith(
              new Error('500 Internal Server Error on update')
            );
            form.removeEventListener('submit', handleSubmit);
            mockStore.bills.mockClear();
          });
        });
      });
    });
  });
};
