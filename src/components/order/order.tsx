import { FC, useMemo } from 'react';
import { useMcQuery } from '@commercetools-frontend/application-shell';
import { TLineItem, TQuery, TQuery_OrderArgs } from '../../types/generated/ctp';
import FetchOrder from './fetch-order.ctp.graphql';
import {
  GRAPHQL_TARGETS,
  NO_VALUE_FALLBACK,
} from '@commercetools-frontend/constants';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { getErrorMessage } from '../../helpers';
import Text from '@commercetools-uikit/text';
import {
  InfoMainPage,
  useModalState,
} from '@commercetools-frontend/application-components';
import Card from '@commercetools-uikit/card';
import Spacings from '@commercetools-uikit/spacings';
import DataTable from '@commercetools-uikit/data-table';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import { useCustomViewContext } from '@commercetools-frontend/application-shell-connectors';
import Label from '@commercetools-uikit/label';
import Steps from '../steps';
import Grid from '@commercetools-uikit/grid';
import OrderDetailsItem from './order-details-item';
import {
  PlusBoldIcon,
  ExportIcon,
  SpeechBubbleIcon,
} from '@commercetools-uikit/icons';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import PrimaryButton from '@commercetools-uikit/primary-button';
import { ComponentProps } from '../../routes';
import LogComplaint from '../log-complaint/log-complaint';

const Order: FC<ComponentProps> = ({ id }) => {
  const { dataLocale, projectLanguages } = useCustomViewContext((context) => ({
    dataLocale: context.dataLocale,
    projectLanguages: context.project?.languages,
  }));
  const { openModal, isModalOpen, closeModal } = useModalState();
  const createStepsDefinition = useMemo(
    () => [
      {
        key: 'Ordered',
        label: 'Ordered',
      },
      {
        key: 'Picking',
        label: 'Picking',
      },
      {
        key: 'Picked',
        label: 'Picked',
      },
      {
        key: 'ReadyToShip',
        label: 'Ready To Ship',
      },
      {
        key: 'InTransit',
        label: 'In Transit',
      },
      {
        key: 'Delivered',
        label: 'Delivered',
      },
    ],
    []
  );
  const { data, error, loading } = useMcQuery<TQuery, TQuery_OrderArgs>(
    FetchOrder,
    {
      variables: {
        id: id,
      },
      context: {
        target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
      },
    }
  );

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }

  if (!loading && !data?.order) {
    return (
      <ContentNotification type="info">
        <Text.Body>No Results</Text.Body>
      </ContentNotification>
    );
  }

  let to: string = '';
  if (data?.order?.shippingAddress) {
    const address = data?.order?.shippingAddress;
    if (address?.streetName) {
      to += address?.streetName + '+';
      if (address?.streetNumber) {
        to += address?.streetName + '+';
      }
    }
    if (address?.postalCode) {
      to += address?.postalCode + '+';
    }
    if (address?.city) {
      to += address?.city + '+';
    }
  }

  const today = new Date();
  const deliveryStepy = [
    {
      date: today.setDate(today.getDate() - 1),
      headline: 'In Transit',
      body: 'On its way',
    },
    {
      date: today.setDate(today.getDate() - 1),
      headline: 'In Transit',
      body: 'Arrived at Station',
    },
    {
      date: today.setDate(today.getDate() - 1),
      headline: 'In Transit',
      body: 'Arrived at Facility',
    },
    {
      date: today.setDate(today.getDate() - 1),
      headline: 'Transit Start',
      body: 'Leaving our warehouse',
    },
    {
      date: today.setDate(today.getDate() - 1),
      headline: 'Picking',
      body: 'All items picked',
    },
    {
      date: today.setDate(today.getDate() - 1),
      headline: 'Picking',
      body: 'Started',
    },
  ];

  return (
    <InfoMainPage
      title="Order Tracking Form"
      customTitleRow={
        <Spacings.Inline justifyContent="space-between">
          <Text.Headline as="h2">Order Tracking Form</Text.Headline>
          <Spacings.Inline justifyContent="space-between">
            <PrimaryButton iconLeft={<PlusBoldIcon />} label={'Open in OMS Lite'} />
            <SecondaryButton
              iconLeft={<SpeechBubbleIcon />}
              label={'Add Note'}
              onClick={openModal}
            />
            <SecondaryButton
              iconLeft={<ExportIcon />}
              label={'Export as XLS'}
            />
          </Spacings.Inline>
        </Spacings.Inline>
      }
      subtitle={'This data is coming directly from the Order Management System'}
    >
      <Card theme="light" type="raised">
        <Spacings.Stack scale={'xl'}>
          <Grid
            gridGap="16px"
            gridAutoColumns="1fr"
            gridTemplateColumns="repeat(2, 1fr)"
          >
            <Grid.Item>
              <DataTable<TLineItem>
                rows={data?.order?.lineItems || []}
                columns={[
                  { key: 'image', label: 'Image' },
                  { key: 'name', label: 'Name' },
                ]}
                itemRenderer={(item, column) => {
                  switch (column.key) {
                    case 'id':
                      return item.id;
                    case 'image':
                      return (
                        <div style={{ width: '50px', height: '50px' }}>
                          <img
                            src={item.variant?.images?.[0]?.url}
                            style={{
                              verticalAlign: 'middle',
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain',
                            }}
                          />
                        </div>
                      );
                    case 'name':
                      return formatLocalizedString(
                        {
                          name: transformLocalizedFieldToLocalizedString(
                            item.nameAllLocales ?? []
                          ),
                        },
                        {
                          key: 'name',
                          locale: dataLocale,
                          fallbackOrder: projectLanguages,
                          fallback: NO_VALUE_FALLBACK,
                        }
                      );
                    default:
                      return null;
                  }
                }}
              />
            </Grid.Item>
            <Grid.Item>
              <Spacings.Stack>
                <Spacings.Inline
                  justifyContent={'space-between'}
                  alignItems={'flex-start'}
                  scale={'m'}
                >
                  <Label>Order ID:</Label>
                  <Text.Body>{data?.order?.id}</Text.Body>
                </Spacings.Inline>
                <Spacings.Inline
                  justifyContent={'space-between'}
                  alignItems={'flex-start'}
                  scale={'m'}
                >
                  <Label>Carrier</Label>
                  <Text.Body>StarTrack</Text.Body>
                </Spacings.Inline>
              </Spacings.Stack>
            </Grid.Item>
          </Grid>

          <Steps steps={createStepsDefinition} activeStepKey={'InTransit'} />
          <Grid
            gridGap="16px"
            gridAutoColumns="1fr"
            gridTemplateColumns="repeat(2, 1fr)"
          >
            <Grid.Item>
              <Spacings.Stack scale={'m'}>
                {deliveryStepy.map((item, index) => {
                  return <OrderDetailsItem {...item} key={index} />;
                })}
              </Spacings.Stack>
            </Grid.Item>
            {to.length > 0 && (
              <Grid.Item>
                <iframe
                  width="100%"
                  height="450"
                  frameBorder={0}
                  style={{ border: 0 }}
                  referrerPolicy={'no-referrer-when-downgrade'}
                  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.170583686579!2d151.2068537124685!3d-33.885260319802!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12ae21e9e4fa15%3A0x7da04f274262cfb0!2s12%20Holt%20St%2C%20Surry%20Hills%20NSW%202010!5e0!3m2!1sen!2sau!4v1719838104602!5m2!1sen!2sau&destination=${to}`}
                />
              </Grid.Item>
            )}
          </Grid>
        </Spacings.Stack>
      </Card>
      {data?.order && (
        <LogComplaint
          isModalOpen={isModalOpen}
          closeModal={closeModal}
          order={data.order}
        />
      )}
    </InfoMainPage>
  );
};

export default Order;
