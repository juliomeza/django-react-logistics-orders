# Generated by Django 5.1.6 on 2025-02-26 13:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0011_orderclass_order_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='reference_number',
            field=models.CharField(blank=True, help_text='Reference number from the customer', max_length=50, null=True),
        ),
    ]
