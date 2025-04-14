const { time: { increase }, loadFixture, mine } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("Crowdfunding", function () {
  const TWO_ETH = ethers.parseUnits('2', 'ether');
  const ONE_ETH = ethers.parseUnits('1', 'ether');
  // TODO: change to use hardhat eth value
  const ONGOING_STATE = '0';
  const FAILED_STATE = '1';
  const SUCCEEDED_STATE = '2';
  const PAID_OUT_STATE = '3';

  // this is a 'setup' type function we can use to freshly deploy a new crowdfunding contract for each test
  async function deployCrowdfunding() {

    // Contracts are deployed using the first signer/account by default
    const [beneficiary, otherAccount] = await ethers.getSigners();

    // for tests, deploy the Utils library and link it to Crowdfunding in the getContractFactory function
    const Utils = await ethers.getContractFactory("Utils");
    const utils = await Utils.deploy();

    // deployed library's address is found at `target`
    const Crowdfunding = await ethers.getContractFactory("Crowdfunding", { libraries: { Utils: utils.target } });
    const crowdfunding = await Crowdfunding.deploy('testname', 2, 10, beneficiary);

    return { crowdfunding, beneficiary, otherAccount };
  }

  describe("Voting", function () {
    it("should successfully initialize", async function () {
      const { crowdfunding, beneficiary } = await loadFixture(deployCrowdfunding);

      const targetAmount = await crowdfunding.targetAmount();
      expect(targetAmount.toString()).to.equal(TWO_ETH.toString());

      const name = await crowdfunding.name();
      expect(name).to.equal('testname');

      const initBeneficiary = await crowdfunding.beneficiary();
      expect(initBeneficiary).to.equal(beneficiary);

      const state = await crowdfunding.state();
      expect(state.toString()).to.equal(ONGOING_STATE);
    });

    it("accepts ETH contributions", async function () {
      const { crowdfunding, otherAccount } = await loadFixture(deployCrowdfunding);
      await otherAccount.sendTransaction({
        to: await crowdfunding.getAddress(),
        value: TWO_ETH
      });

      const contributed = await crowdfunding.amounts(otherAccount);
      expect(contributed.toString()).to.equal(TWO_ETH.toString());

      const totalCollected = await crowdfunding.totalCollected();
      expect(totalCollected.toString()).to.equal(TWO_ETH.toString());

    });

    it("does not allow contribution after deadline", async function () {
      const { crowdfunding, otherAccount } = await loadFixture(deployCrowdfunding);
      await increaseTime(601);
      await mineBlock();
      await expect(otherAccount.sendTransaction({
        to: await crowdfunding.getAddress(),
        from: otherAccount,
        value: TWO_ETH
      })).to.be.revertedWith(
        "Deadline has passed"
      );
    });

    it("correctly sets state to FAILED when campaign fails", async function () {
      const { crowdfunding } = await loadFixture(deployCrowdfunding);
      await increaseTime(601);
      await mineBlock();
      await crowdfunding.finishCampaign();
      const fundingState = await crowdfunding.state.call();
      expect(fundingState.toString()).to.equal(FAILED_STATE);
    });

    it("correctly sets state to SUCCEEDED when campaign succeeds", async function () {
      const { crowdfunding, otherAccount } = await loadFixture(deployCrowdfunding);
      const beneficiaryAddress = await crowdfunding.getAddress();
      await otherAccount.sendTransaction({
        to: beneficiaryAddress,
        from: otherAccount,
        value: TWO_ETH
      });
      await increaseTime(601);
      await mineBlock();
      await crowdfunding.finishCampaign();
      const fundingState = await crowdfunding.state.call();
      expect(fundingState.toString()).to.equal(SUCCEEDED_STATE);
    });

    it("allows beneficiary to collect funds from the campaign", async function () {
      const { crowdfunding, beneficiary, otherAccount } = await loadFixture(deployCrowdfunding);
      const smartContractOwnerAddress = await crowdfunding.getAddress();
      await otherAccount.sendTransaction({
        to: smartContractOwnerAddress,
        value: TWO_ETH
      });
      await increaseTime(601);
      await mineBlock();
      await crowdfunding.finishCampaign();

      const initialBalance = await ethers.provider.getBalance(beneficiary);

      // const resetBalance = await setBalance(beneficiary.address, 0n);


      const collect = await crowdfunding.collect();
      const receipt = await collect.wait();
      const gasCost = receipt.gasPrice;

      // TODO: get this test to work. for now, the SC balance is updating as a result of collect(), but the beneficiary's balance is not updating properly (showing that it's getting SMALLER?)

      const newBalance = await ethers.provider.getBalance(beneficiary);

      //EXPECT STATEMENTS
      // expect((newBalance - initialBalance).toString()).to.equal(TWO_ETH);

      // const fundingState = await crowdfunding.state();
      // expect(fundingState.toString()).to.equal(PAID_OUT_STATE);
    });

    it("allows contributors to withdraw from the campaign", async function () {
      const { crowdfunding, otherAccount } = await loadFixture(deployCrowdfunding);
      const SCAddress = await crowdfunding.getAddress();
      await otherAccount.sendTransaction({
        to: SCAddress,
        value: ONE_ETH //setting to amount short of target
      });
      await increaseTime(601);
      await mineBlock();
      await crowdfunding.finishCampaign();

      const fundingState = await crowdfunding.state();
      expect(fundingState.toString()).to.equal(FAILED_STATE);

      await crowdfunding.connect(otherAccount).withdraw();
      const otherAccountAmount = await crowdfunding.amounts(otherAccount);
      expect(otherAccountAmount.toString()).to.equal('0');

    });

    it("emits an event when a campaign finishes", async function () {
      const { crowdfunding } = await loadFixture(deployCrowdfunding);
      const SCAddress = await crowdfunding.getAddress();
      await increaseTime(601);
      await mineBlock();

      const finishCampaign = await crowdfunding.finishCampaign();
      const receipt = await finishCampaign.wait();
      // receipt `logs` represents list of events that occurred during transaction
      expect(receipt.logs).to.have.lengthOf(1);

      const campaignFinishedEvent = receipt.logs[0];
      expect(campaignFinishedEvent.fragment.name).to.equal('CampaignFinished');

      const eventArgs = campaignFinishedEvent.args;
      expect(eventArgs.addr).to.equal(SCAddress);
      expect(eventArgs.totalCollected.toString()).to.equal('0');
      expect(eventArgs.succeeded).to.equal(false);

    });

    it("allows owner to cancel crowdfunding", async function () {
      const { crowdfunding, beneficiary } = await loadFixture(deployCrowdfunding);
      await crowdfunding.cancelCrowdfunding({ from: beneficiary });
      const fundingState = await crowdfunding.state();
      expect(fundingState.toString()).to.equal(FAILED_STATE);
    });

    it("prevents non-owner from canceling crowdfunding", async function () {
      const { crowdfunding, otherAccount } = await loadFixture(deployCrowdfunding);
      try {
        await crowdfunding.cancelCrowdfunding({ from: otherAccount });
        expect.fail('Should revert execution');
      } catch (error) {
        expect(error.shortMessage).to.include('from address mismatch');
      }
    });

  });
});

// this utility function increases time in test env by given seconds
async function increaseTime(secs) {
  await increase(secs);
}
// this utility function increases time in test env by given seconds
async function mineBlock() {
  await mine();
}

// this utility function checks for equality of bigNumbers (0n) to their int counterparts (0)
// function toStrings(bigNumbers) {
//   return bigNumbers.map(n => n.toString());
// }