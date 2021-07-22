import axios from 'axios';
import { getHost } from './Environment';

export class Calculator {

    static currentProcess: Calculator | null;

    private isDelayed = false;
    private isCanceled = false;

    private constructor(private app:string, private content: string, private condition: string, private data: any, private dispatch: (RecalculatedData: any, ValidationResults: any) => void, cancel: boolean) {
        this.sleep(1, Calculator.calc, this);
        this.isCanceled = cancel;
    }

    sleep(waitSec: number, callbackFunc: (target: Calculator) => void, arg: Calculator) {
        var spanedSec = 0;

        var waitFunc = function () {
            spanedSec++;
            if (spanedSec >= waitSec) {
                if (callbackFunc) callbackFunc(arg);
                return;
            }

            clearTimeout(id);
            id = setTimeout(waitFunc, 1000);
        };

        var id = setTimeout(waitFunc, 1000);
    }

    public static do(app: string, content: string, condition: string, data: any, dispatch: (RecalculatedData: any, ValidationResults: any) => void) {
		Calculator.cancel();
		Calculator.currentProcess = new Calculator(app, content, condition, data, dispatch, false);
    }

    public static cancel() {
        if (Calculator.currentProcess == null) return;
        Calculator.currentProcess.isCanceled = true;
    }

    public static delay() {
        if (Calculator.currentProcess == null) return;
        Calculator.currentProcess.isDelayed = true;
    }

    public static resume() {
        if (Calculator.currentProcess == null) return;
        Calculator.currentProcess.isCanceled = false;
        Calculator.calc(Calculator.currentProcess);
    }

    private static calc(target: Calculator) {
        if (target.isCanceled) {
			console.log("caneled");
            return;
        }

        if (target.isDelayed) {
            console.log("delay");
            Calculator.do(target.app, target.content, target.condition, target.data, target.dispatch);
            return;
        }

        getHost(target.app).then(host => {
            axios.post(`https://${host}/${target.content}/recalculate`, target.data).then(result => {
                if (!target.isCanceled) {
                    console.log("done");
                    target.dispatch(result.data.RecalculatedData, result.data.ValidationResults);
                }
            }).then(() => {
                Calculator.currentProcess = null;
            });
        });
    }
}