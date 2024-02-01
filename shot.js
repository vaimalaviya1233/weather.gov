const { exec: cpExec } = require("node:child_process");
const { chromium } = require("playwright");

// Be sure to install playwright. It's not in the npm dependencies for good
// reason.

const sleep = async (ms) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

const exec = async (cmd) =>
  new Promise((resolve, reject) => {
    cpExec(cmd, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

const targets = [
  {
    commit: "phase/end-prototype",
    prep: ["make zap", "sleep 3", "make install-site"],
    url: "http://localhost:8080/",
  },
  {
    commit: "beta-v0.1.0",
    url: "http://localhost:8080/local/SGX/37/67/Anaheim, CA",
  },
  {
    commit: "beta-v0.2.0",
    url: "http://localhost:8080/local/SGX/37/67/Anaheim, CA",
  },
  {
    commit: "beta-v0.3.0",
    url: "http://localhost:8080/local/SGX/37/67/Anaheim, CA",
  },
  {
    commit: "beta-v0.4.0",
    url: "http://localhost:8080/local/SGX/37/67/Anaheim, CA",
  },
  {
    commit: "beta-v0.5.0",
    url: "http://localhost:8080/local/SGX/37/67/Anaheim, CA",
  },
].map((target) => {
  if (!target.prep) {
    return {
      ...target,
      prep: [
        "rm web/sites/settings.dev.php",
        "cp web/sites/example.settings.dev.php web/sites/settings.dev.php",
        "make zap",
      ],
    };
  }
  return target;
});

const main = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { height: 500, width: 480 } });

  let i = 0;

  // eslint-disable-next-line
  for await (const { commit, prep, url } of targets) {
    console.log(`checking out ${commit}`);
    await exec(`git checkout ${commit}`);
    // eslint-disable-next-line
    for await (const cmd of prep) {
      console.log(`  > ${cmd}`);
      await exec(cmd);
      await sleep(3000);
    }

    await page.goto(url);
    await page.screenshot({
      path: `shots/${`${i}`.padStart(3, "0")}.png`,
      fullPage: true,
    });
    console.log("  # got screenshot");
    i += 1;
  }
  await page.close();
  await browser.close();
};
main();
