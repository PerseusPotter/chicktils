const ThreadPool = Java.type('java.util.concurrent.Executors').newFixedThreadPool(4);

export function run(cb) {
  // org.mozilla.javascript.EvaluatorException: The choice of Java method java.util.concurrent.AbstractExecutorService.submit matching JavaScript argument types (function) is ambiguous; candidate methods are:
  // ThreadPool.submit(cb);
  ThreadPool.submit(cb, 0);
};