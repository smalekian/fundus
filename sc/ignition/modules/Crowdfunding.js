// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CrowdfundingModule", (m) => {
  const campaignName = m.getParameter("campaignName", "test campaign")
  const targetAmountEth = m.getParameter("targetAmountEth", 1)
  const durationInMin = m.getParameter("durationInMin", 5 * 24 * 60)
  const beneficiaryAddress = m.getParameter("beneficiaryAddress", "<<INSERT WALLET ADDRESS>>") //ex. 0xabc0123abc0123abc0123abc0123abc0123abc01

  const utils = m.library("Utils");

  const crowdfunding = m.contract("Crowdfunding", [
    campaignName,
    targetAmountEth,
    durationInMin,
    beneficiaryAddress
  ], {
    libraries: {
      Utils: utils
    }
  });

  return { crowdfunding };
});
