import * as React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { colors } from "../styles";
import { IMenuItem, IOrderItem } from "../helpers/types";
import {
  orderLoadMenu,
  orderAddItem,
  orderRemoveItem,
  orderSubmit,
  orderUnsubmit
} from "../redux/_order";
import Button from "../components/Button";
import PageWrapper from "../components/PageWrapper";
import PaymentModal from "../components/PaymentModal";
import Summary from "../components/Summary";
import Modal from "../components/Modal";
import Loader from "../components/Loader";
import ListItem from "../components/ListItem";
import {
  SColumnWrapper,
  SColumn,
  SColumnOrder,
  SColumnHeader,
  SColumnFooter,
  SColumnList,
  SColumnRow,
  STitle
} from "../components/common";

const SHeader = styled.div`
  width: 100%;
  background-color: rgb(${colors.dark});
  color: rgb(${colors.white});
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 82px;
`;

const SBranding = styled.h1`
  text-transform: uppercase;
  font-size: 24px;
  margin: 4px 0px;
  margin-left: 10px;
`;

const SLogo = styled.img`
  border-radius: 6px;
  width: 40px;
  height: 40px;
`;

class Order extends React.Component<any, any> {
  public componentDidMount() {
    const businessName = this.props.match.params.businessName;
    if (businessName) {
      this.props.orderLoadMenu(businessName);
    }
  }
  public render() {
    const {
      businessData,
      warning,
      loading,
      submitted,
      items,
      checkout,
      payment,
      uri
    } = this.props;
    return !this.props.loading ? (
      <React.Fragment>
        <SHeader>
          {businessData.logo && <SLogo src={businessData.logo} alt="" />}
          <SBranding>{businessData.name}</SBranding>
        </SHeader>
        <SColumnWrapper>
          <SColumn width={items.length ? 70 : 100}>
            <SColumnHeader>
              <STitle>{`Menu`}</STitle>
            </SColumnHeader>
            <SColumnList>
              {businessData.menu &&
                businessData.menu.map((item: IMenuItem) => (
                  <ListItem
                    key={`menu-${item.name}`}
                    item={item}
                    businessData={businessData}
                    onClick={() => this.props.orderAddItem(item)}
                  />
                ))}
            </SColumnList>
          </SColumn>
          <SColumnOrder width={items.length ? 30 : 0}>
            <SColumnHeader>
              <STitle>{`Order`}</STitle>
            </SColumnHeader>
            <SColumnList>
              {items.map((item: IOrderItem) => (
                <ListItem
                  noImage
                  key={`order-${item.name}`}
                  item={item}
                  businessData={businessData}
                  actions={[
                    { label: "Remove", callback: this.props.orderRemoveItem },
                    { label: "Add", callback: this.props.orderAddItem }
                  ]}
                />
              ))}
            </SColumnList>
            <SColumnFooter>
              <Summary checkout={checkout} businessData={businessData} />
              <SColumnRow>
                <Button
                  marginTop={12}
                  onClick={this.props.orderSubmit}
                >{`Pay`}</Button>
              </SColumnRow>
            </SColumnFooter>
          </SColumnOrder>

          <PaymentModal
            loading={loading}
            businessData={businessData}
            submitted={submitted}
            payment={payment}
            checkout={checkout}
            uri={uri}
            orderUnsubmit={this.props.orderUnsubmit}
          />

          <Modal show={warning.show}>
            <h4>{warning.message}</h4>
          </Modal>
        </SColumnWrapper>
      </React.Fragment>
    ) : (
      <PageWrapper center>
        <Loader />
      </PageWrapper>
    );
  }
}

const reduxProps = (store: any) => ({
  businessData: store.order.businessData,
  warning: store.order.warning,
  loading: store.order.loading,
  submitted: store.order.submitted,
  items: store.order.items,
  checkout: store.order.checkout,
  uri: store.order.uri,
  payment: store.order.payment
});

export default connect(
  reduxProps,
  { orderLoadMenu, orderAddItem, orderRemoveItem, orderSubmit, orderUnsubmit }
)(Order);
